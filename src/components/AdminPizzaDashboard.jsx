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
                    name: slice.flavorName,
                    type: slice.flavorType,
                    slices: []
                };
            }
            slicesByFlavor[slice.flavorId].slices.push(slice);
        });

        // 3. Create Pizza Buckets
        let pizzaBuckets = [];

        Object.keys(slicesByFlavor).forEach(flavorId => {
            const flavorData = slicesByFlavor[flavorId];
            const totalSlices = flavorData.slices.length;
            const totalPizzas = Math.ceil(totalSlices / 8);

            for (let i = 0; i < totalPizzas; i++) {
                const pizzaSlices = flavorData.slices.slice(i * 8, (i + 1) * 8);
                const pizzaId = `${flavorId}-${i}`;

                // Count sectors
                let stiCount = 0;
                let sgsCount = 0;

                pizzaSlices.forEach(s => {
                    // Normalize sector name just in case
                    const sec = s.sector?.toUpperCase() || '';
                    if (sec.includes('STI')) stiCount++;
                    else if (sec.includes('SGS')) sgsCount++;
                });

                // Determine winner
                let winner = 'TIE';
                if (stiCount > sgsCount) winner = 'STI';
                else if (sgsCount > stiCount) winner = 'SGS';

                // Check override
                if (overrides[pizzaId]) {
                    winner = overrides[pizzaId];
                }

                // Creation time (time of the first slice? or last? User said "nova... vai se tornar")
                // Let's use the time of the LAST slice added to this bucket to represent "arrival" of the pizza/slice
                // Actually, user said "Caso chegue uma nova... ela vai se tornar a numero 1".
                // If I have a bucket with 1 slice, it's a "new" pizza.
                // If I add a 2nd slice, it's the same pizza, but maybe "newer"?
                // Let's use the timestamp of the *first* slice to determine "creation" of the bucket?
                // Or the *last* slice to determine "update"?
                // "Caso chegue uma nova completa ou meia pizza do STI, ela vai se tornar a numero 1"
                // This implies LIFO for STI.
                // If I use the *latest* slice timestamp, then the most recently updated pizza is #1.
                const lastUpdate = pizzaSlices[pizzaSlices.length - 1].timestamp;

                pizzaBuckets.push({
                    id: pizzaId,
                    flavorName: flavorData.name,
                    flavorType: flavorData.type,
                    slicesCount: pizzaSlices.length,
                    stiCount,
                    sgsCount,
                    winner,
                    lastUpdate,
                    isComplete: pizzaSlices.length === 8,
                    slices: pizzaSlices // Add the actual slices with user data
                });
            }
        });

        // 4. Combine Halves into Meio a Meio
        const completePizzas = [];
        const halfPizzas = [];
        const otherPizzas = [];

        pizzaBuckets.forEach(p => {
            if (p.slicesCount === 8) {
                completePizzas.push(p);
            } else if (p.slicesCount === 4) {
                halfPizzas.push(p);
            } else {
                otherPizzas.push(p);
            }
        });

        const pairedHalves = [];
        const unpairedHalves = [];

        // Sort halves by lastUpdate to pair them somewhat chronologically
        halfPizzas.sort((a, b) => new Date(a.lastUpdate) - new Date(b.lastUpdate));

        for (let i = 0; i < halfPizzas.length; i += 2) {
            if (i + 1 < halfPizzas.length) {
                const p1 = halfPizzas[i];
                const p2 = halfPizzas[i + 1];

                // Combine
                const combinedSlices = [...p1.slices, ...p2.slices];

                // Recalculate stats
                let stiCount = 0;
                let sgsCount = 0;
                combinedSlices.forEach(s => {
                    const sec = s.sector?.toUpperCase() || '';
                    if (sec.includes('STI')) stiCount++;
                    else if (sec.includes('SGS')) sgsCount++;
                });

                let winner = 'TIE';
                if (stiCount > sgsCount) winner = 'STI';
                else if (sgsCount > stiCount) winner = 'SGS';

                const combinedId = `combined-${p1.id}-${p2.id}`;

                // Check override for combined ID
                if (overrides[combinedId]) {
                    winner = overrides[combinedId];
                }

                pairedHalves.push({
                    id: combinedId,
                    flavorName: `${p1.flavorName} / ${p2.flavorName}`,
                    flavor1: p1.flavorName,
                    flavor2: p2.flavorName,
                    flavorType1: p1.flavorType,
                    flavorType2: p2.flavorType,
                    isMeioAMeio: true,
                    slicesCount: 8,
                    stiCount,
                    sgsCount,
                    winner,
                    lastUpdate: new Date(p1.lastUpdate) > new Date(p2.lastUpdate) ? p1.lastUpdate : p2.lastUpdate,
                    isComplete: true,
                    slices: combinedSlices
                });
            } else {
                unpairedHalves.push(halfPizzas[i]);
            }
        }

        const finalPizzas = [...completePizzas, ...pairedHalves, ...unpairedHalves, ...otherPizzas];

        // 5. Assign Numbers
        const stiPizzas = finalPizzas.filter(p => p.winner === 'STI').sort((a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate));
        const sgsPizzas = finalPizzas.filter(p => p.winner === 'SGS').sort((a, b) => new Date(a.lastUpdate) - new Date(b.lastUpdate));
        const tiePizzas = finalPizzas.filter(p => p.winner === 'TIE');

        // Assign numbers
        let currentNumber = 1;

        stiPizzas.forEach(p => {
            p.number = currentNumber++;
        });

        // SGS continues from where STI left off?
        // "as pizzas de numero 1,2 e 3 sao da STI e a 4 e 5 é da SGS"
        // So yes.
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
                            <p className="text-xs text-text-secondary mb-2 font-medium">Pedidos:</p>
                            <div className="flex flex-wrap gap-1.5">
                                {/* Group by userName and count occurrences */}
                                {Object.entries(
                                    pizza.slices.reduce((acc, slice) => {
                                        const key = `${slice.userName}-${slice.sector}`;
                                        if (!acc[key]) {
                                            acc[key] = { userName: slice.userName, sector: slice.sector, count: 0 };
                                        }
                                        acc[key].count++;
                                        return acc;
                                    }, {})
                                ).map(([key, data]) => (
                                    <div
                                        key={key}
                                        className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${data.sector === 'STI'
                                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                            : 'bg-green-500/20 text-green-300 border border-green-500/30'
                                            }`}
                                        title={`${data.userName} - ${data.count} ${data.count === 1 ? 'pedaço' : 'pedaços'}`}
                                    >
                                        <span className="truncate max-w-[120px]">
                                            {data.userName}
                                        </span>
                                        <span className="text-text-secondary shrink-0">
                                            {data.count}×
                                        </span>
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
