import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(response) {
        try {
            const client = await clientPromise;
            const db = client.db('socialNetwork');
     
            const users = await db
                .collection("users")
                .find({})
                .sort({ metacritic: -1 })
                .limit(10)
                .toArray();
     
            return new NextResponse('Works')

        } catch (error) {
            return new NextResponse(error.message)
        }


}