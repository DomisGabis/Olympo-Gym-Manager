import { useEffect, useState } from 'react';
import styles from './EntriesCard.module.css';
import HomePageCard from './HomePageCard';
import { apiClient } from '../../services/apiClient';

const HISTORY_MONTHS_COUNT = 5;
const MONTH_NAMES = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
];

interface MonthlyHistory {
    monthName: string;
    count: number;
}

function EntriesCard() {
    const [history, setHistory] = useState<MonthlyHistory[]>([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const fetchEntriesData = async () => {
            setLoading(true);
            try {
                const currentMonth = new Date().getMonth() + 1;
                const currentYear = new Date().getFullYear();

                const promises = [];

                for (let i = 0; i < HISTORY_MONTHS_COUNT; i++) {
                    const monthToFetch = currentMonth - i;
                    const yearToFetch = monthToFetch <= 0 ? currentYear - 1 : currentYear;
                    const finalMonth = monthToFetch > 0 ? monthToFetch : monthToFetch + 12;

                    const fetchPromise = apiClient.get('/club-entries/my', {
                        params: { month: `${yearToFetch}-${String(finalMonth).padStart(2, '0')}` }
                    }).then(response => {
                        if (response.data.success) {
                            return {
                                monthName: MONTH_NAMES[finalMonth - 1],
                                count: response.data.data.length,
                            };
                        }
                        return null;
                    });

                    promises.push(fetchPromise);
                }
                const results = await Promise.all(promises);
                const validHistory = results.filter(Boolean) as { monthName: string; count: number }[];
                setHistory(validHistory.toReversed());
                console.log('Dane zostały pobrane i przetworzone:', validHistory);

            } catch (error) {
                // console.error('Błąd pobierania statystyk wykresu:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEntriesData();
    }, []);

    if (loading || !history.length) {
        return (
            <div className={styles.cardContainer} style={{ justifyContent: 'center', alignItems: 'center' }}>
                <span className={styles.loader}>Ładowanie statystyk...</span>
            </div>
        );
    }

    // Parametry siatki SVG (szerokość x wysokość)
    const svgWidth = 300;
    const svgHeight = 100;
    const padding = 0;

    // Znajdujemy maksymalną wartość, aby wykres automatycznie się skalował (min. 1, żeby nie dzielić przez zero)
    const maxEntries = Math.max(...history.map(h => h.count), 1);

    // Wyliczamy współrzędne (X, Y) dla każdego z 3 punktów
    const points = history.map((item, index) => {
        // Rozkładamy punkty równomiernie na osi X (0, 50%, 100% szerokości)
        const x = padding + (index * (svgWidth - padding * 2)) / (history.length - 1);

        // Oś Y w SVG liczy się od góry, więc odwracamy wartość (maksimum jest na samej górze)
        const y = svgHeight - padding - (item.count / maxEntries) * (svgHeight - padding * 2);

        return { x, y, count: item.count };
    });

    // Łączymy punkty w ścieżkę dla atrybutu 'd' w tagu <path>
    const linePath = points.reduce((acc, p, i) =>
        i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`,
        ''
    );

    // Ścieżka pod wypełnienie gradientem (domykamy linie do dołu wykresu)
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${svgHeight} L ${points[0].x} ${svgHeight} Z`;

    return (
        <HomePageCard title="Wejścia w tym miesiącu">
            <div className={styles.container}>
                <div className={styles.entriesCount}>
                    {history[history.length - 1]?.count !== null ? history[history.length - 1]?.count : '-'}
                </div>
                <hr />

                <div className={styles.chartWrapper}>
                    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className={styles.miniChart}>
                        <defs>
                            {/* Gradient dla linii wykresu */}
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="60%" stopColor="#dcac01" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#dcac01" stopOpacity="0.9" />
                            </linearGradient>

                            {/* Subtelna poświata pod wykresem */}
                            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#dcac01" stopOpacity="0.10" />
                                <stop offset="100%" stopColor="#dcac01" stopOpacity="0.0" />
                            </linearGradient>
                        </defs>

                        {/* Cieniowanie pod linią */}
                        <path d={areaPath} fill="url(#areaGradient)" />

                        {/* Główna linia wykresu */}
                        <path
                            d={linePath}
                            fill="none"
                            stroke="url(#chartGradient)"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {/* Interaktywne kropki na wykresie */}
                        {points.map((p, i) => (
                            <g key={i} className={styles.chartPointGroup}>
                                <circle
                                    cx={p.x}
                                    cy={p.y}
                                    r="4"
                                    className={styles.chartPoint}
                                />
                                <text
                                    x={p.x}
                                    y={p.y - 15}
                                    className={styles.tooltipText}
                                >
                                    {p.count}
                                </text>
                                <text 
                                    x={p.x}
                                    y={svgHeight + 25}
                                    className={`${styles.svgAxisLabel} ${i === points.length - 1 ? styles.currentMonthText : ''}`}
                                >
                                    {history[i].monthName}
                                </text>
                            </g>
                        ))}
                    </svg>
                </div>
            </div>
        </HomePageCard>
    );
}

export default EntriesCard