import axios from 'axios'
import { ApiResponce } from './ApiResponce.js';
import { ApiError } from './ApiError.js';

export const RPC = async (age,hypertension,heart_disease,bmi,HbA1c_level,blood_glucose_level) => {
    try {
        const Responce = await axios.post(`${process.env.API_URL}`,{
            age:age,
            hypertension:hypertension,
            heart_disease:heart_disease,
            bmi:bmi,
            HbA1c_level:HbA1c_level,
            blood_glucose_level:blood_glucose_level
        },{
            headers:{
                "Content-Type":"application/json",
                "Content-Encoding":"br",
                "Connection":"keep-alive"      
            }
        })
        console.log(Responce.data);
        return Responce.data.predictions;

    } catch (error) {
        if (axios.AxiosError()) {
            throw ApiError(400, "api call fald")
        }
    }
}