import { supabase } from "@/lib/supabaseClient";
import { request } from "http";

export async function POST(request: Request) {

    const body = await request.json()
    const { data, error } = await supabase.storage.from('images').upload(`${body.image.name + String(Math.random()).slice(2, 7)}`, body.image)
}