import { useQuery } from '@tanstack/react-query';
import {
    getCities,
    getDistricts,
    getShippingCost,
} from '../api/destinationApi';

export const useGetCities = (provinceId?: number | string) => {
    return useQuery({
        queryKey: ['cities', provinceId],
        queryFn: async () => {
            if (!provinceId) throw new Error('Province ID is required');
            return await getCities(Number(provinceId));
        },
        enabled: !!provinceId,
    });
};

export const useGetDistricts = (cityId?: number | string) => {
    return useQuery({
        queryKey: ['districts', cityId],
        queryFn: async () => {
            if (!cityId) throw new Error('City ID is required');
            return await getDistricts(Number(cityId));
        },
        enabled: !!cityId,
    });
};

export const useGetShippingCost = (data: {
    destination?: number | string;
    courier?: string;
}) => {
    return useQuery({
        queryKey: ['shipping-cost', data.destination, data.courier],
        queryFn: async () => {
            if (!data.destination || !data.courier)
                throw new Error('Destination and courier are required');
            return await getShippingCost({
                destination: Number(data.destination),
                courier: data.courier,
            });
        },
        enabled: !!(data.destination && data.courier),
    });
};
