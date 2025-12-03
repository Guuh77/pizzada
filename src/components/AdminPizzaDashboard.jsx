import React, { useState, useEffect, useMemo } from 'react';
import { Pizza, Users, ArrowLeftRight, AlertCircle, Check } from 'lucide-react';
import PizzaProgress, { PizzaSVG } from './PizzaProgress';

const AdminPizzaDashboard = ({ pedidos, sabores }) => {
    const [overrides, setOverrides] = useState({}); // { pizzaId: 'STI' | 'SGS' }

    // Create a map of flavor ID to type
    const flavorTypeMap = useMemo(() => {
        const map = {};
        sabores.forEach(s => {
            map[s.id] = s.tipo;
        });
        return map;
    }, [sabores]);

    // Process orders into pizzas
    const pizzas = useMemo(() => {
        // 1. Flatten all items into slices with metadata
        const allSlices = [];

        // Sort pedidos by date to ensure deterministic processing
        const sortedPedidos = [...pedidos].sort((a, b) =>
            new Date(a.data_pedido) - new Date(b.data_pedido)
        );

        sortedPedidos.forEach(pedido => {
            pedido.itens.forEach(item => {
                for (let i = 0; i < item.quantidade; i++) {
                    allSlices.push({
                        flavorId: item.sabor_id,
                        flavorName: item.sabor_nome,
                        flavorType: flavorTypeMap[item.sabor_id] || 'SALGADA',
                        sector: pedido.usuario_setor, // 'STI' or 'SGS'
                        orderId: pedido.id,
                        timestamp: pedido.data_pedido,
                        userName: pedido.usuario_nome // Add user name
                    });
                }
            });
        });

        // 2. Group by Flavor
        const slicesByFlavor = {};
        allSlices.forEach(slice => {
            if (!slicesByFlavor[slice.flavorId]) {
                slicesByFlavor[slice.flavorId] = {
                    id: slice.flavorId,
                    name: slice.flavorName,
                    type: slice.flavorType,
                    slices: []
                };
            }
            slicesByFlavor[slice.flavorId].slices.push(slice);
        });

        // Helper function to process a list of flavors (like the backend)
        const processFlavorGroup = (flavors) => {
            // Sort by total slices DESC (Popularity)
            flavors.sort((a, b) => b.slices.length - a.slices.length);

            const completePizzas = [];
            const halfPizzas = [];
            const leftovers = [];

            flavors.forEach(flavor => {
                const totalSlices = flavor.slices.length;
                const inteiras = Math.floor(totalSlices / 8);
                const resto = totalSlices % 8;

                // Extract Whole Pizzas
                for (let i = 0; i < inteiras; i++) {
                    const pizzaSlices = flavor.slices.slice(i * 8, (i + 1) * 8);
                    completePizzas.push({
                        id: `${flavor.id}-inteira-${i}`,
                        flavorName: flavor.name,
                        flavorType: flavor.type,
                        slicesCount: 8,
                        slices: pizzaSlices,
                        isMeioAMeio: false,
                        lastUpdate: pizzaSlices[pizzaSlices.length - 1].timestamp // Use last slice time
                    });
                }

                // Extract Half Pizzas
                const meias = Math.floor(resto / 4);
                const restoFinal = resto % 4;
                const baseIndex = inteiras * 8;

                for (let i = 0; i < meias; i++) {
                    const start = baseIndex + (i * 4);
                    const pizzaSlices = flavor.slices.slice(start, start + 4);
                    halfPizzas.push({
                        id: `${flavor.id}-meia-${i}`,
                        flavorName: flavor.name,
                        flavorType: flavor.type,
                        slicesCount: 4,
                        slices: pizzaSlices,
                        lastUpdate: pizzaSlices[pizzaSlices.length - 1].timestamp
                    });
                }

                // Leftovers
                if (restoFinal > 0) {
                    const start = baseIndex + (meias * 4);
                    const pizzaSlices = flavor.slices.slice(start, start + restoFinal);
                    leftovers.push({
                        id: `${flavor.id}-resto`,
                        flavorName: flavor.name,
                        flavorType: flavor.type,
                        slicesCount: restoFinal,
                        slices: pizzaSlices,
                        isMeioAMeio: false,
                        lastUpdate: pizzaSlices[pizzaSlices.length - 1].timestamp
                    });
                }
            });

            // Pair Half Pizzas
            const pairedHalves = [];
            const unpairedHalves = [];

            for (let i = 0; i < halfPizzas.length; i += 2) {
                if (i + 1 < halfPizzas.length) {
                    const p1 = halfPizzas[i];
                    const p2 = halfPizzas[i + 1];
                    const combinedSlices = [...p1.slices, ...p2.slices];
                    
                    // Determine latest update for the pair
                    const lastUpdate = new Date(p1.lastUpdate) > new Date(p2.lastUpdate) ? p1.lastUpdate : p2.lastUpdate;

                    pairedHalves.push({
                        id: `combined-${p1.id}-${p2.id}`,
                        flavorName: `${p1.flavorName} / ${p2.flavorName}`,
                        flavor1: p1.flavorName,
                        flavor2: p2.flavorName,
                        flavorType1: p1.flavorType,
                        flavorType2: p2.flavorType,
                        isMeioAMeio: true,
                        slicesCount: 8,
                        slices: combinedSlices,
                        lastUpdate: lastUpdate
                    });
                } else {
                    unpairedHalves.push(halfPizzas[i]);
                }
            }

            return { completePizzas, pairedHalves, unpairedHalves, leftovers };
        };

        // Split flavors into Salgada and Doce
        const allFlavors = Object.values(slicesByFlavor);
        const salgadaFlavors = allFlavors.filter(f => f.type !== 'DOCE');
        const doceFlavors = allFlavors.filter(f => f.type === 'DOCE');

        // Process groups
        const salgadaResult = processFlavorGroup(salgadaFlavors);
        const doceResult = processFlavorGroup(doceFlavors);

        // Combine all results
        let finalPizzas = [
            ...salgadaResult.completePizzas,
            ...salgadaResult.pairedHalves,
            ...doceResult.completePizzas,
            ...doceResult.pairedHalves,
            // Add unpaired halves as "incomplete" pizzas for now, or just show them?
            // The Admin Dashboard usually shows everything.
            // Let's treat unpaired halves and leftovers as "incomplete" pizzas.
            ...salgadaResult.unpairedHalves.map(p => ({ ...p, isMeioAMeio: false })), // Treat as incomplete whole for display? Or keep as half?
            ...doceResult.unpairedHalves.map(p => ({ ...p, isMeioAMeio: false })),
            ...salgadaResult.leftovers,
            ...doceResult.leftovers
        ];

        // Now apply STI/SGS logic to ALL final pizzas
        finalPizzas = finalPizzas.map(pizza => {
            let stiCount = 0;
            let sgsCount = 0;

            pizza.slices.forEach(s => {
                const sec = s.sector?.toUpperCase() || '';
                if (sec.includes('STI')) stiCount++;
                else if (sec.includes('SGS')) sgsCount++;
            });

            let winner = 'TIE';
            if (stiCount > sgsCount) winner = 'STI';
            else if (sgsCount > stiCount) winner = 'SGS';

            if (overrides[pizza.id]) {
                winner = overrides[pizza.id];
            }

            return {
                ...pizza,
                stiCount,
                sgsCount,
                winner,
                isComplete: pizza.slicesCount === 8
            };
        });

        // 5. Assign Numbers
        const stiPizzas = finalPizzas.filter(p => p.winner === 'STI').sort((a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate)); // Newest first? Or Oldest first?
        // User said: "Caso chegue uma nova... ela vai se tornar a numero 1". So LIFO (Newest First).
        // But previously I saw "sort((a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate))" for STI.
        // And "sort((a, b) => new Date(a.lastUpdate) - new Date(b.lastUpdate))" for SGS?
        // Let's keep the previous sorting logic for consistency if it was intentional.
        // Previous code:
        // const stiPizzas = finalPizzas.filter(p => p.winner === 'STI').sort((a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate));
        // const sgsPizzas = finalPizzas.filter(p => p.winner === 'SGS').sort((a, b) => new Date(a.lastUpdate) - new Date(b.lastUpdate));
        
        const sgsPizzas = finalPizzas.filter(p => p.winner === 'SGS').sort((a, b) => new Date(a.lastUpdate) - new Date(b.lastUpdate));
        const tiePizzas = finalPizzas.filter(p => p.winner === 'TIE');

        // Assign numbers
        let currentNumber = 1;

        stiPizzas.forEach(p => {
            p.number = currentNumber++;
        });

        sgsPizzas.forEach(p => {
            p.number = currentNumber++;
        });

        return { stiPizzas, sgsPizzas, tiePizzas };
    }, [pedidos, overrides, flavorTypeMap]);

    const handleSwap = (pizzaId, currentWinner) => {
        const newWinner = currentWinner === 'STI' ? 'SGS' : 'STI';
        setOverrides(prev => ({
            ...prev,
            [pizzaId]: newWinner
        }));
    };

    const handleTieBreak = (pizzaId, winner) => {
        setOverrides(prev => ({
            ...prev,
            [pizzaId]: winner
        }));
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                    <Pizza className="text-primary" />
                    Pizzas em Tempo Real (Admin)
                </h2>
                <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500"></span> STI
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span> SGS
                    </div>
                </div>
            </div>

            {/* TIE BREAK SECTION */}
            {pizzas.tiePizzas.length > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-yellow-500 mb-4 flex items-center gap-2">
                        <AlertCircle />
                        Empates - Necessário Decisão
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pizzas.tiePizzas.map(pizza => (
                            <PizzaCard
                                key={pizza.id}
                                pizza={pizza}
                                onTieBreak={handleTieBreak}
                                isTie={true}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* STI PIZZAS */}
                {pizzas.stiPizzas.map(pizza => (
                    <PizzaCard
                        key={pizza.id}
                        pizza={pizza}
                        onSwap={handleSwap}
                    />
                ))}

                {/* SGS PIZZAS */}
                {pizzas.sgsPizzas.map(pizza => (
                    <PizzaCard
                        key={pizza.id}
                        pizza={pizza}
                        onSwap={handleSwap}
                    />
                ))}
            </div>

            {pizzas.stiPizzas.length === 0 && pizzas.sgsPizzas.length === 0 && pizzas.tiePizzas.length === 0 && (
                <div className="text-center py-12 text-text-secondary">
                    Nenhuma pizza em andamento.
                </div>
            )}
        </div>
    );
};

const PizzaCard = ({ pizza, onSwap, onTieBreak, isTie }) => {
    const isSti = pizza.winner === 'STI';
    const borderColor = isTie ? 'border-yellow-500' : isSti ? 'border-blue-500' : 'border-green-500';
    const bgColor = isTie ? 'bg-yellow-500/5' : isSti ? 'bg-blue-500/5' : 'bg-green-500/5';

    // Determine colors based on type
    // Sweet: Brown (#5D4037)
    // Half Sweet: Neon Purple (#D946EF) / Brown (#5D4037)
    // Savory: Yellow (#FACC15) / Red (#EF4444)

    let color1 = "#FACC15"; // Default Yellow
    let color2 = "#EF4444"; // Default Red

    if (pizza.isMeioAMeio) {
        // For half/half, check individual types
        if (pizza.flavorType1 === 'DOCE') {
            color1 = "#5D4037"; // Brown
        }
        if (pizza.flavorType2 === 'DOCE') {
            color2 = "#5D4037"; // Brown
        }

        // Special case: If BOTH are sweet, make one Purple and one Brown as requested
        // "se ficar meio a maio, ficar metade roxo neon e metade marrom normal"
        if (pizza.flavorType1 === 'DOCE' && pizza.flavorType2 === 'DOCE') {
            color1 = "#D946EF"; // Neon Purple
            color2 = "#5D4037"; // Brown
        }
    } else {
        // Whole pizza
        if (pizza.flavorType === 'DOCE') {
            color1 = "#5D4037"; // Brown
        }
    }

    return (
        <div className={`card relative overflow-hidden border-2 ${borderColor} ${bgColor} transition-all duration-300 hover:scale-[1.02]`}>
            {/* Number Badge */}
            {!isTie && (
                <div className={`absolute top-0 left-0 w-12 h-12 flex items-center justify-center text-xl font-bold text-white rounded-br-2xl z-10 ${isSti ? 'bg-blue-500' : 'bg-green-500'}`}>
                    {pizza.number}
                </div>
            )}

            <div className="flex flex-col items-center pt-8 pb-4">
                <h3 className="text-lg font-bold text-text-primary mb-2 text-center h-12 flex items-center">
                    {pizza.flavorName}
                </h3>

                <div className="transform scale-75">
                    {pizza.isMeioAMeio ? (
                        <div className="flex flex-col items-center">
                            <PizzaSVG slices={8} color={color1} secondaryColor={color2} />
                            <div className="mt-2 text-xs text-center space-y-1">
                                <div className="flex items-center gap-1 justify-center">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color1 }}></div>
                                    <span className="truncate max-w-[100px]">{pizza.flavor1}</span>
                                </div>
                                <div className="flex items-center gap-1 justify-center">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color2 }}></div>
                                    <span className="truncate max-w-[100px]">{pizza.flavor2}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <PizzaProgress total_pedacos={pizza.slicesCount} sabor="" color={color1} />
                    )}
                </div>

                <div className="w-full px-4 mt-4 space-y-3">
                    {/* Stats */}
                    <div className="flex justify-between text-sm font-medium bg-black/20 p-2 rounded-lg">
                        <span className="text-blue-400">STI: {pizza.stiCount}</span>
                        <span className="text-green-400">SGS: {pizza.sgsCount}</span>
                    </div>

                    {/* Controls */}
                    {isTie ? (
                        <div className="flex gap-2">
                            <button
                                onClick={() => onTieBreak(pizza.id, 'STI')}
                                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors"
                            >
                                STI
                            </button>
                            <button
                                onClick={() => onTieBreak(pizza.id, 'SGS')}
                                className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-colors"
                            >
                                SGS
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => onSwap(pizza.id, pizza.winner)}
                            className="w-full py-2 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-text-secondary hover:text-text-primary rounded-lg transition-colors text-sm"
                        >
                            <ArrowLeftRight size={16} />
                            Trocar para {isSti ? 'SGS' : 'STI'}
                        </button>
                    )}

                    {/* User Orders List */}
                    {pizza.slices && pizza.slices.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                            <p className="text-xs text-text-secondary mb-2 font-medium uppercase tracking-wider">Pedidos:</p>
                            <div className="flex flex-col gap-1.5">
                                {Object.entries(
                                    pizza.slices.reduce((acc, slice) => {
                                        const key = `${slice.userName}-${slice.sector}-${slice.flavorName}`;
                                        if (!acc[key]) {
                                            acc[key] = {
                                                userName: slice.userName,
                                                sector: slice.sector,
                                                flavorName: slice.flavorName,
                                                count: 0
                                            };
                                        }
                                        acc[key].count++;
                                        return acc;
                                    }, {})
                                ).map(([key, data]) => (
                                    <div
                                        key={key}
                                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${data.sector === 'STI'
                                            ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20 hover:bg-blue-500/20'
                                            : 'bg-green-500/10 text-green-300 border border-green-500/20 hover:bg-green-500/20'
                                            }`}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">{data.userName}</span>
                                            <span className="text-[10px] opacity-70 font-medium tracking-wide">
                                                {data.flavorName}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded">
                                            <span className="font-bold text-white">{data.count}</span>
                                            <span className="text-[10px] opacity-70">ped.</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPizzaDashboard;
