import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

const chartConfig = {
    order: {
        label: 'Pesanan',
        color: 'var(--chart-1)',
    },
} satisfies ChartConfig;

type OrderChartProps = {
    chartData: {
        date: string;
        order: number;
        is_hourly: boolean;
    }[];
};

function OrderChart({ chartData }: OrderChartProps) {
    const isHourly = chartData.length > 0 && chartData[0].is_hourly;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Grafik Pesanan</CardTitle>
                <CardDescription>
                    {isHourly ? 'Grafik pesanan per jam (24 Jam)' : 'Grafik pesanan dalam 1 bulan'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                >
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient
                                id="fillOrder"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-order)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-order)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={isHourly ? 2 : 32}
                            tickFormatter={(value) => {
                                if (isHourly) return value;
                                const date = new Date(value);
                                if (isNaN(date.getTime())) return value;
                                return date.toLocaleDateString('id-ID', {
                                    month: 'short',
                                    day: 'numeric',
                                });
                            }}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value) => {
                                        if (isHourly) return `Pukul ${value}`;
                                        const date = new Date(value);
                                        if (isNaN(date.getTime())) return value;
                                        return date.toLocaleDateString('id-ID', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        });
                                    }}
                                    indicator="dot"
                                />
                            }
                        />
                        <Area
                            dataKey="order"
                            type="natural"
                            fill="url(#fillOrder)"
                            stroke="var(--color-order)"
                            stackId="a"
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

export default OrderChart;
