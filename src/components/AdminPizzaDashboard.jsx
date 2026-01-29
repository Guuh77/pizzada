import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Pizza, Users, ArrowLeftRight, AlertCircle, Check, X, Shuffle, Save } from 'lucide-react';
import PizzaProgress, { PizzaSVG } from './PizzaProgress';
import { pizzaConfigService } from '../services/api';

const AdminPizzaDashboard = ({ pedidos, sabores, eventoId }) => {
    const [overrides, setOverrides] = useState({}); // { pizzaId: 'STI' | 'SGS' }
    const [pairingOverrides, setPairingOverrides] = useState({}); // { halfId1: halfId2 } - custom pairings
    const [swapModalPizza, setSwapModalPizza] = useState(null); // Pizza being edited for swap
    const [availableHalves, setAvailableHalves] = useState([]); // All available halves for swapping
    const [configLoaded, setConfigLoaded] = useState(false);
    const [saving, setSaving] = useState(false);
    const isFirstRender = useRef(true);

    // Load saved config when eventoId changes
    useEffect(() => {
        if (!eventoId) return;

        const loadConfig = async () => {
            try {
                const response = await pizzaConfigService.get(eventoId);
                if (response.data) {
                    setOverrides(response.data.sector_overrides || {});
                    setPairingOverrides(response.data.pairing_overrides || {});
                }
            } catch (err) {
                console.error('Erro ao carregar configurações de pizza:', err);
            } finally {
                setConfigLoaded(true);
            }
        };

        loadConfig();
    }, [eventoId]);

    // Auto-save when overrides change (debounced)
    useEffect(() => {
        // Skip first render and when config hasn't loaded yet
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (!configLoaded || !eventoId) return;

        const saveConfig = async () => {
            setSaving(true);
            try {
                console.log('[DEBUG] Salvando config para evento:', eventoId, { sector_overrides: overrides, pairing_overrides: pairingOverrides });
                await pizzaConfigService.save(eventoId, {
                    sector_overrides: overrides,
                    pairing_overrides: pairingOverrides
                });
                console.log('[DEBUG] Config salva com sucesso!');
            } catch (err) {
                console.error('Erro ao salvar configurações:', err);
                alert('Erro ao salvar configurações de pizza. Verifique o console.');
            } finally {
                setSaving(false);
            }
        };

        // Debounce save by 500ms
        const timeout = setTimeout(saveConfig, 500);
        return () => clearTimeout(timeout);
    }, [overrides, pairingOverrides, eventoId, configLoaded]);

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
            // Sort by total slices DESC (Popularity), then by ID for deterministic ordering
            // IMPORTANT: This ensures frontend and backend generate the same pizza IDs
            flavors.sort((a, b) => {
                if (b.slices.length !== a.slices.length) {
                    return b.slices.length - a.slices.length;
                }
                return a.id - b.id; // Secondary sort by ID for determinism
            });

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
                        flavorId: flavor.id,
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

            return { completePizzas, halfPizzas, leftovers };
        };

        // Split flavors into Salgada and Doce
        const allFlavors = Object.values(slicesByFlavor);
        const salgadaFlavors = allFlavors.filter(f => f.type !== 'DOCE');
        const doceFlavors = allFlavors.filter(f => f.type === 'DOCE');

        // Process groups
        const salgadaResult = processFlavorGroup(salgadaFlavors);
        const doceResult = processFlavorGroup(doceFlavors);

        // Collect all half pizzas for the swap modal
        const allHalves = [...salgadaResult.halfPizzas, ...doceResult.halfPizzas];

        // Apply custom pairings from pairingOverrides
        const pairedSet = new Set();
        const pairedHalves = [];
        const unpairedHalves = [];

        // First, apply custom pairings
        Object.entries(pairingOverrides).forEach(([halfId1, halfId2]) => {
            const h1 = allHalves.find(h => h.id === halfId1);
            const h2 = allHalves.find(h => h.id === halfId2);
            if (h1 && h2 && !pairedSet.has(halfId1) && !pairedSet.has(halfId2)) {
                const combinedSlices = [...h1.slices, ...h2.slices];
                const lastUpdate = new Date(h1.lastUpdate) > new Date(h2.lastUpdate) ? h1.lastUpdate : h2.lastUpdate;

                pairedHalves.push({
                    id: `combined-${h1.id}-${h2.id}`,
                    flavorName: `${h1.flavorName} / ${h2.flavorName}`,
                    flavor1: h1.flavorName,
                    flavor2: h2.flavorName,
                    flavorType1: h1.flavorType,
                    flavorType2: h2.flavorType,
                    half1Id: h1.id,
                    half2Id: h2.id,
                    isMeioAMeio: true,
                    slicesCount: 8,
                    slices: combinedSlices,
                    lastUpdate: lastUpdate,
                    isCustomPairing: true
                });

                pairedSet.add(halfId1);
                pairedSet.add(halfId2);
            }
        });

        // Then, auto-pair remaining halves (same type only)
        const salgadaUnpaired = salgadaResult.halfPizzas.filter(h => !pairedSet.has(h.id));
        const doceUnpaired = doceResult.halfPizzas.filter(h => !pairedSet.has(h.id));

        const autoPair = (halves) => {
            for (let i = 0; i < halves.length; i += 2) {
                if (i + 1 < halves.length) {
                    const h1 = halves[i];
                    const h2 = halves[i + 1];
                    const combinedSlices = [...h1.slices, ...h2.slices];
                    const lastUpdate = new Date(h1.lastUpdate) > new Date(h2.lastUpdate) ? h1.lastUpdate : h2.lastUpdate;

                    pairedHalves.push({
                        id: `combined-${h1.id}-${h2.id}`,
                        flavorName: `${h1.flavorName} / ${h2.flavorName}`,
                        flavor1: h1.flavorName,
                        flavor2: h2.flavorName,
                        flavorType1: h1.flavorType,
                        flavorType2: h2.flavorType,
                        half1Id: h1.id,
                        half2Id: h2.id,
                        isMeioAMeio: true,
                        slicesCount: 8,
                        slices: combinedSlices,
                        lastUpdate: lastUpdate,
                        isCustomPairing: false
                    });
                } else {
                    unpairedHalves.push({ ...halves[i], isMeioAMeio: false });
                }
            }
        };

        autoPair(salgadaUnpaired);
        autoPair(doceUnpaired);

        // Combine all results
        let finalPizzas = [
            ...salgadaResult.completePizzas,
            ...doceResult.completePizzas,
            ...pairedHalves,
            ...unpairedHalves,
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
        const stiPizzas = finalPizzas.filter(p => p.winner === 'STI').sort((a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate));
        const sgsPizzas = finalPizzas.filter(p => p.winner === 'SGS').sort((a, b) => new Date(a.lastUpdate) - new Date(b.lastUpdate));
        const tiePizzas = finalPizzas.filter(p => p.winner === 'TIE');

        // Assign numbers only to complete pizzas (8 slices)
        let currentNumber = 1;

        stiPizzas.forEach(p => {
            if (p.isComplete) {
                p.number = currentNumber++;
            }
        });

        sgsPizzas.forEach(p => {
            if (p.isComplete) {
                p.number = currentNumber++;
            }
        });

        // Sort to put complete pizzas (with numbers) first, incomplete ones last
        const sortByComplete = (a, b) => {
            if (a.isComplete && !b.isComplete) return -1;
            if (!a.isComplete && b.isComplete) return 1;
            if (a.isComplete && b.isComplete) return a.number - b.number;
            return 0;
        };

        stiPizzas.sort(sortByComplete);
        sgsPizzas.sort(sortByComplete);

        return { stiPizzas, sgsPizzas, tiePizzas, allHalves };
    }, [pedidos, overrides, pairingOverrides, flavorTypeMap]);

    // Update available halves when pizzas change
    useEffect(() => {
        setAvailableHalves(pizzas.allHalves || []);
    }, [pizzas.allHalves]);

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

    // Open swap modal for a meio a meio pizza
    const handleOpenSwapModal = (pizza) => {
        setSwapModalPizza(pizza);
        setSelectedHalfToSwap(null);
    };

    // State for which half is selected to swap
    const [selectedHalfToSwap, setSelectedHalfToSwap] = useState(null);

    // Find which pizza a half belongs to
    const findPizzaContainingHalf = (halfId) => {
        const allPizzas = [...pizzas.stiPizzas, ...pizzas.sgsPizzas, ...pizzas.tiePizzas];
        return allPizzas.find(p => p.isMeioAMeio && (p.half1Id === halfId || p.half2Id === halfId));
    };

    // TRUE SWAP: When swapping half A for half C:
    // - Pizza 1 was: A + B (we're removing A, keeping B)
    // - Pizza 2 was: C + D (we're removing C, keeping D)
    // - New Pizza 1: B + C (B gets C)
    // - New Pizza 2: A + D (D gets A) -- THIS IS THE KEY FIX
    const handleSwapHalf = (currentHalfId, newHalfId) => {
        if (!swapModalPizza || !selectedHalfToSwap) return;

        // Find which half we're keeping from current pizza
        const keepingHalfId = swapModalPizza.half1Id === currentHalfId
            ? swapModalPizza.half2Id
            : swapModalPizza.half1Id;

        // Find the pizza that contains the new half
        const otherPizza = findPizzaContainingHalf(newHalfId);

        // Find the orphan half from the other pizza (the one that will now pair with currentHalfId)
        let orphanHalfId = null;
        if (otherPizza && otherPizza.isMeioAMeio) {
            orphanHalfId = otherPizza.half1Id === newHalfId
                ? otherPizza.half2Id
                : otherPizza.half1Id;
        }

        // Create new pairings
        const newPairings = { ...pairingOverrides };

        // Remove ALL old pairings involving any of the 4 halves
        Object.keys(newPairings).forEach(key => {
            const val = newPairings[key];
            if ([currentHalfId, keepingHalfId, newHalfId, orphanHalfId].includes(key) ||
                [currentHalfId, keepingHalfId, newHalfId, orphanHalfId].includes(val)) {
                delete newPairings[key];
            }
        });

        // Create new pairings:
        // 1. keepingHalf + newHalf (what the user wants)
        newPairings[keepingHalfId] = newHalfId;

        // 2. currentHalf + orphanHalf (the true swap - the two "abandoned" halves pair together)
        if (orphanHalfId) {
            newPairings[currentHalfId] = orphanHalfId;
        }

        setPairingOverrides(newPairings);
        setSwapModalPizza(null);
        setSelectedHalfToSwap(null);
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                    <Pizza className="text-primary" />
                    Pizzas em Tempo Real (Admin)
                    {saving && (
                        <span className="text-xs font-normal text-gray-400 flex items-center gap-1">
                            <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></span>
                            Salvando...
                        </span>
                    )}
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
                                onSwapHalf={handleOpenSwapModal}
                                isTie={true}
                                availableHalves={availableHalves}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* COMPLETE PIZZAS SECTION (Numbered - STI + SGS) */}
            {(pizzas.stiPizzas.filter(p => p.isComplete).length > 0 || pizzas.sgsPizzas.filter(p => p.isComplete).length > 0) && (
                <div>
                    <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                        <Check className="text-green-500" />
                        Pizzas Completas
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {/* STI Complete Pizzas */}
                        {pizzas.stiPizzas.filter(p => p.isComplete).map(pizza => (
                            <PizzaCard
                                key={pizza.id}
                                pizza={pizza}
                                onSwap={handleSwap}
                                onSwapHalf={handleOpenSwapModal}
                                availableHalves={availableHalves}
                            />
                        ))}

                        {/* SGS Complete Pizzas */}
                        {pizzas.sgsPizzas.filter(p => p.isComplete).map(pizza => (
                            <PizzaCard
                                key={pizza.id}
                                pizza={pizza}
                                onSwap={handleSwap}
                                onSwapHalf={handleOpenSwapModal}
                                availableHalves={availableHalves}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* INCOMPLETE PIZZAS SECTION (Avulsas - without numbers) */}
            {(pizzas.stiPizzas.filter(p => !p.isComplete).length > 0 || pizzas.sgsPizzas.filter(p => !p.isComplete).length > 0) && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-text-secondary mb-4 flex items-center gap-2">
                        <AlertCircle className="text-orange-500" />
                        Pizzas Avulsas (Incompletas)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {/* STI Incomplete Pizzas */}
                        {pizzas.stiPizzas.filter(p => !p.isComplete).map(pizza => (
                            <PizzaCard
                                key={pizza.id}
                                pizza={pizza}
                                onSwap={handleSwap}
                                onSwapHalf={handleOpenSwapModal}
                                availableHalves={availableHalves}
                            />
                        ))}

                        {/* SGS Incomplete Pizzas */}
                        {pizzas.sgsPizzas.filter(p => !p.isComplete).map(pizza => (
                            <PizzaCard
                                key={pizza.id}
                                pizza={pizza}
                                onSwap={handleSwap}
                                onSwapHalf={handleOpenSwapModal}
                                availableHalves={availableHalves}
                            />
                        ))}
                    </div>
                </div>
            )}

            {pizzas.stiPizzas.length === 0 && pizzas.sgsPizzas.length === 0 && pizzas.tiePizzas.length === 0 && (
                <div className="text-center py-12 text-text-secondary">
                    Nenhuma pizza em andamento.
                </div>
            )}

            {/* Modal de Troca de Metades - REDESIGNED */}
            {swapModalPizza && swapModalPizza.isMeioAMeio && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a1a2e] border border-purple-500/30 rounded-xl p-6 max-w-lg w-full shadow-2xl">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Shuffle className="text-purple-400" />
                                Trocar Metade
                            </h2>
                            <button
                                onClick={() => { setSwapModalPizza(null); setSelectedHalfToSwap(null); }}
                                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Step 1: Select which half to swap */}
                        <div className="mb-6">
                            <p className="text-sm text-gray-400 mb-3 font-medium">
                                Passo 1: Qual metade você quer TROCAR?
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setSelectedHalfToSwap(swapModalPizza.half1Id)}
                                    className={`p-4 rounded-lg border-2 transition-all ${selectedHalfToSwap === swapModalPizza.half1Id
                                        ? 'bg-purple-500/30 border-purple-500 ring-2 ring-purple-500/50'
                                        : 'bg-[#252542] border-gray-600 hover:border-purple-400'
                                        }`}
                                >
                                    <p className={`font-bold ${selectedHalfToSwap === swapModalPizza.half1Id ? 'text-purple-300' : 'text-white'}`}>
                                        {swapModalPizza.flavor1}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {selectedHalfToSwap === swapModalPizza.half1Id ? '✓ Selecionada' : 'Clique para selecionar'}
                                    </p>
                                </button>
                                <button
                                    onClick={() => setSelectedHalfToSwap(swapModalPizza.half2Id)}
                                    className={`p-4 rounded-lg border-2 transition-all ${selectedHalfToSwap === swapModalPizza.half2Id
                                        ? 'bg-purple-500/30 border-purple-500 ring-2 ring-purple-500/50'
                                        : 'bg-[#252542] border-gray-600 hover:border-purple-400'
                                        }`}
                                >
                                    <p className={`font-bold ${selectedHalfToSwap === swapModalPizza.half2Id ? 'text-purple-300' : 'text-white'}`}>
                                        {swapModalPizza.flavor2}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {selectedHalfToSwap === swapModalPizza.half2Id ? '✓ Selecionada' : 'Clique para selecionar'}
                                    </p>
                                </button>
                            </div>
                        </div>

                        {/* Step 2: Select new half (only show if step 1 is done) */}
                        {selectedHalfToSwap && (
                            <div className="animate-fadeIn">
                                <p className="text-sm text-gray-400 mb-3 font-medium">
                                    Passo 2: Trocar <span className="text-purple-400 font-bold">
                                        {selectedHalfToSwap === swapModalPizza.half1Id ? swapModalPizza.flavor1 : swapModalPizza.flavor2}
                                    </span> por qual sabor?
                                </p>
                                <div className="bg-[#252542] rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                                    {availableHalves
                                        .filter(h => h.id !== swapModalPizza.half1Id && h.id !== swapModalPizza.half2Id)
                                        .map(half => {
                                            // Find what this half is currently paired with
                                            const currentPizza = findPizzaContainingHalf(half.id);
                                            const currentPartner = currentPizza?.isMeioAMeio
                                                ? (currentPizza.half1Id === half.id ? currentPizza.flavor2 : currentPizza.flavor1)
                                                : null;

                                            return (
                                                <button
                                                    key={half.id}
                                                    onClick={() => handleSwapHalf(selectedHalfToSwap, half.id)}
                                                    className="w-full p-3 bg-[#1a1a2e] hover:bg-purple-500/20 rounded-lg transition-colors text-left border border-gray-700 hover:border-purple-500"
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-semibold text-white">{half.flavorName}</p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {half.slices.map(s => s.userName).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
                                                            </p>
                                                        </div>
                                                        {currentPartner && (
                                                            <span className="text-[10px] bg-gray-700 text-gray-300 px-2 py-1 rounded">
                                                                Par atual: {currentPartner}
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                </div>
                                {availableHalves.filter(h => h.id !== swapModalPizza.half1Id && h.id !== swapModalPizza.half2Id).length === 0 && (
                                    <p className="text-center text-gray-500 py-4">Não há outras metades disponíveis.</p>
                                )}

                                {/* Info box explaining the swap */}
                                <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                                    <p className="text-xs text-purple-300">
                                        <strong>💡 Como funciona:</strong> Ao trocar, os sabores "órfãos" serão automaticamente pareados entre si.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => { setSwapModalPizza(null); setSelectedHalfToSwap(null); }}
                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const PizzaCard = ({ pizza, onSwap, onSwapHalf, onTieBreak, isTie }) => {
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
            {/* Number Badge - Only for complete pizzas */}
            {!isTie && pizza.number && (
                <div className={`absolute top-0 left-0 w-12 h-12 flex items-center justify-center text-xl font-bold text-white rounded-br-2xl z-10 ${isSti ? 'bg-blue-500' : 'bg-green-500'}`}>
                    {pizza.number}
                </div>
            )}

            {/* Custom Pairing Badge */}
            {pizza.isCustomPairing && (
                <div className="absolute top-0 right-0 bg-purple-500 text-white text-[10px] px-2 py-1 rounded-bl-lg font-semibold">
                    Personalizada
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
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => onSwap(pizza.id, pizza.winner)}
                                className="w-full py-2 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-text-secondary hover:text-text-primary rounded-lg transition-colors text-sm"
                            >
                                <ArrowLeftRight size={16} />
                                Trocar para {isSti ? 'SGS' : 'STI'}
                            </button>

                            {/* Swap Half Button - Only for meio a meio pizzas */}
                            {pizza.isMeioAMeio && onSwapHalf && (
                                <button
                                    onClick={() => onSwapHalf(pizza)}
                                    className="w-full py-2 flex items-center justify-center gap-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 hover:text-purple-300 border border-purple-500/30 rounded-lg transition-colors text-sm font-medium"
                                >
                                    <Shuffle size={16} />
                                    Trocar Metade
                                </button>
                            )}
                        </div>
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
