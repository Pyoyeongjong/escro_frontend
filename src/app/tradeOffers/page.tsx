// src/app/tradeOffers/page.tsx
'use client';

import { Suspense } from "react";
import TradeOffersClient from "./TradeOffersClient";

export default function TradeOffersPage() {
    return (
        <Suspense fallback={<div>로딩 중...</div>}>
            <TradeOffersClient />
        </Suspense>
    );
}