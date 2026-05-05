import DatePicker from '@/components/date-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import useDebounce from '@/hooks/useDebounce';
import { order } from '@/routes/reports';
import { router } from '@inertiajs/react';
import { format } from 'date-fns';
import { XIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
];

type FiltersSectionProps = {
    filters: {
        year: string;
        month: string;
        date: string;
    };
};

function FiltersSection({ filters }: FiltersSectionProps) {
    const initialYear = filters.year || new Date().getFullYear().toString();
    const initialMonth = filters.month || new Date().getMonth().toString(); // Standardized to 0-indexed
    const initialDate = filters.date || '';

    const [year, setYear] = useState(initialYear);
    const [month, setMonth] = useState(initialMonth);
    const [date, setDate] = useState<Date | undefined>(
        initialDate ? new Date(initialDate) : undefined,
    );

    const debouncedYear = useDebounce(year, 500);
    const debouncedMonth = useDebounce(month, 500);
    const debouncedDate = useDebounce(date, 500);
    const isInitialMount = useRef(true);

    const prevYear = useRef(initialYear);
    const prevMonth = useRef(initialMonth);
    const prevDateString = useRef(initialDate);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const dateString = debouncedDate
            ? format(debouncedDate, 'yyyy-MM-dd')
            : '';
        const yearChanged = debouncedYear !== prevYear.current;
        const monthChanged = debouncedMonth !== prevMonth.current;
        const dateChanged = dateString !== prevDateString.current;

        if (yearChanged || monthChanged || dateChanged) {
            prevYear.current = String(debouncedYear);
            prevMonth.current = String(debouncedMonth);
            prevDateString.current = dateString;

            router.get(
                order().url,
                {
                    year: debouncedYear,
                    month: debouncedMonth,
                    date: dateString,
                },
                {
                    preserveState: true,
                    replace: true,
                },
            );
        }
    }, [debouncedYear, debouncedMonth, debouncedDate]);

    const handleClearDate = () => {
        setDate(undefined);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Periode Laporan</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-6">
                    {/* Month/Year Filters */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div
                            className={
                                date ? 'pointer-events-none opacity-50' : ''
                            }
                        >
                            <Label htmlFor="year">Tahun:</Label>
                            <Select value={year} onValueChange={setYear}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih tahun" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {[
                                            ...Array(
                                                new Date().getFullYear() -
                                                    2020 +
                                                    1,
                                            ),
                                        ].map((_, i) => {
                                            const yearStr = (
                                                2020 + i
                                            ).toString();
                                            return (
                                                <SelectItem
                                                    key={yearStr}
                                                    value={yearStr}
                                                >
                                                    {yearStr}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div
                            className={
                                date ? 'pointer-events-none opacity-50' : ''
                            }
                        >
                            <Label htmlFor="month">Bulan:</Label>
                            <Select value={month} onValueChange={setMonth}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih bulan" />
                                </SelectTrigger>
                                <SelectContent className="max-h-40 overflow-y-auto">
                                    <SelectGroup>
                                        {months.map((monthName, index) => {
                                            return (
                                                <SelectItem
                                                    key={monthName}
                                                    value={index.toString()}
                                                >
                                                    {monthName}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Date Filter */}
                    <div className="border-t pt-4">
                        <Label
                            htmlFor="date"
                            className="mb-2 block font-semibold text-primary"
                        >
                            Atau Filter Per Tanggal Spesifik:
                        </Label>
                        <div className="flex max-w-sm items-center gap-2">
                            <DatePicker
                                value={date}
                                onChange={(d) => setDate(d)}
                            />
                            {date && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleClearDate}
                                    title="Bersihkan filter tanggal"
                                >
                                    <XIcon className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        {date && (
                            <p className="mt-2 text-sm text-muted-foreground italic">
                                * Laporan saat ini difilter untuk tanggal{' '}
                                {format(date, 'dd MMMM yyyy')}. Filter bulan &
                                tahun diabaikan.
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default FiltersSection;
