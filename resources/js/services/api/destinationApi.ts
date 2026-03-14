import destinations from '@/routes/user/destinations';
import { City, District, ShippingCost } from '@/types';
import axios from 'axios';

const getCities = async (provinceId: number): Promise<City[]> => {
    const response = await axios.get(destinations.city(provinceId).url);
    return response.data;
};

const getDistricts = async (cityId: number): Promise<District[]> => {
    const response = await axios.get(destinations.district(cityId).url);
    return response.data;
};

const getShippingCost = async (data: {
    destination: number;
    courier: string;
}): Promise<ShippingCost[]> => {
    const response = await axios.post(destinations.shippingCosts().url, data);
    return response.data;
};

export { getCities, getDistricts, getShippingCost };
