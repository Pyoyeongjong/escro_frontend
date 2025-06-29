'use client';

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function NewTradeOfferClient() {
    const searchParams = useSearchParams();
    const productId = searchParams.get("productId");
    const [cost, setCost] = useState("");
    const router = useRouter();

    const handleSubmit = async () => {
        const formData = new FormData();
        console.log(cost);
        formData.append("cost", cost);

        const token = localStorage.getItem("accessToken");

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/${productId}/offerTrade`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cost: Number(cost) })
        });


        if (res.ok) {
            alert("오퍼 등록 완료!");
            router.push('/');
        } else {
            alert("오퍼 등록 실패");
        }
    };

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold">거래 요청</h1>

            <Input
                type="number"
                placeholder="가격"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
            />
            <div className="flex gap-2">
                <Button onClick={handleSubmit}>등록하기</Button>
                <Button onClick={() => router.back()}>상품으로 돌아가기</Button>
            </div>
        </div >
    );
}
