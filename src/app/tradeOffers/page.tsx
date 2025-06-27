"use client";

import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface TradeOffer {
    id: number;
    cost: string;
    buyer: { id: number; name: string };
    accepted: string;
}

export default function TradeOffersPage() {
    const searchParams = useSearchParams();
    const productId = searchParams.get("productId");
    const router = useRouter();
    const [tos, setTos] = useState<TradeOffer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [updated, setUpdated] = useState(0);

    useEffect(() => {
        if (!productId) return;

        const fetchData = async () => {
            try {
                const accessToken = localStorage.getItem("accessToken");

                if (!accessToken) {
                    setError("Access token is missing.");
                    return;
                }

                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/product/getProductsTo/${productId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );

                if (!res.ok) {
                    throw new Error("Failed to fetch trade offers.");
                }

                const data: TradeOffer[] = await res.json();
                console.log(data);
                setTos(data);
            } catch (err: any) {
                setError(err.message || "Unknown error");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [productId, updated]);

    async function refuseTo(id: number) {
        const accessToken = localStorage.getItem("accessToken");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trade-offer/refuse/${id}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            }
        })

        if (res.status === 201) {
            alert("거래 거절");
            setUpdated(updated + 1);
        }
    }

    async function acceptTo(id: number) {
        const accessToken = localStorage.getItem("accessToken");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trade-offer/accept/${id}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            }
        })

        if (res.status === 201) {
            alert("거래 수락");
            router.back();
        }
    }

    if (loading) return <p className="text-gray-500">Loading trade offers...</p>;
    if (error) return <p className="text-red-500">Error: {error}</p>;
    if (tos.length === 0)
        return <p className="text-gray-500">No trade offers available.</p>;

    return (
        <div className="p-6">
            <div className="pt-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold mb-4">Trade Offers</h1>
                <Button onClick={() => router.back()}>뒤로 가기</Button>
            </div>

            <div className="grid gap-4">
                {tos.filter((offer) => offer.accepted == "pending").map((offer) => (

                    <div
                        key={offer.id}
                        className="p-4 border rounded shadow hover:shadow-lg transition flex items-center justify-between"
                    >
                        <div>
                            <p>
                                <span className="font-semibold">Buyer:</span>{" "}
                                {offer.buyer.name}
                            </p>
                            <p>
                                <span className="font-semibold">Offer:</span> ₩{offer.cost}
                            </p>
                        </div>
                        <div>
                            <Button onClick={() => refuseTo(offer.id)}>거절하기</Button>
                            <Button onClick={() => acceptTo(offer.id)}>선택하기</Button>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
}
