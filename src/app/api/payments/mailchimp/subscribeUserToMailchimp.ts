import mailchimp from "@mailchimp/mailchimp_marketing";
import { User } from "../../../../../typings";

mailchimp.setConfig({
    apiKey: process.env.MAILCHIMP_API_KEY,
    server: process.env.MAILCHIMP_API_SERVER,
});

interface MailchimpResponse {
    success: boolean;
    message?: string;
    error?: string;
}

export async function subscribeUserToMailchimp(user: User, hashedEmail: string): Promise<MailchimpResponse> {
    try {
        await mailchimp.lists.setListMember(
            process.env.MAILCHIMP_RUTINAS_AUDIENCE_ID as string,
            hashedEmail,
            {
                email_address: user.email,
                merge_fields: { FNAME: "", LNAME: "" },
                status_if_new: "subscribed",
                vip: true
            }
        );

        await mailchimp.lists.updateListMemberTags(
            process.env.MAILCHIMP_RUTINAS_AUDIENCE_ID as string,
            hashedEmail,
            { tags: [{ name: "VIP", status: "active" }] }
        );

        return { success: true, message: "Usuario suscrito correctamente" };
    } catch (error: any) {
        console.error("Error al suscribir usuario:", error);
        return { 
            success: false, 
            error: error.response?.body?.detail || "Algo salió mal" 
        };
    }
}