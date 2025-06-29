'use client';

import { Suspense } from "react";
import NewTradeOfferClient from "./ApplyNewClient";


export default function NewTradeOfferPage() {
    return (
        <Suspense fallback={<div>로딩 중...</div>}>
            <NewTradeOfferClient />
        </Suspense>
    )
}
