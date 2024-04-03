import axios from 'axios';
import { NextResponse } from 'next/server';

export async function validateRecaptcha(formData: string) {
    console.log('hola')
    let res
    try {
        res = await axios.post(
            "https://www.google.com/recaptcha/api/siteverify",
            formData,
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );

    } catch (e) {
        return { success: false }
    }

    if (res && res.data?.success && res.data?.score > 0.5) {
        console.log("res.data?.score:", res.data?.score);

        return {
            success: true,
            score: res.data.score,
        };
    } else {
        return { success: false };
    }

}
