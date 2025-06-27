"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Rss } from "lucide-react";
import { ethers, parseUnits } from "ethers";
import { Contract } from "ethers";
import { assert } from "console";
import { ProductStatus } from "../../../types/product-status";
import { TradeOfferStatus } from "../../../types/trade-offer-status";

interface UserInfo {
    name: string;
    walletAddress?: string;
    shippingAddress?: string;
}

interface TradeRequest {
    id: number;
    product: { id: number; title: string, status: string }
    cost: number;
    accepted: TradeOfferStatus;
}

interface ProductPost {
    id: number;
    cost: number;
    title: string;
    created_at: string;
    status: ProductStatus;
    buyer: { id: number; name: string };
    trade_offers: { id: number; accepted: string }[];
}

export default function MyPage() {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [myTrades, setMyTrades] = useState<TradeRequest[]>([]);
    const [myProducts, setMyProducts] = useState<ProductPost[]>([]);
    const router = useRouter();
    const [location, setLocation] = useState("");
    const [updated, setUpdated] = useState(0);

    // smart contract
    const contractAddress = "0x7C7836D69E13527F349eE06D08F6AFC45aF788D7";
    const abi = [
        "function create_new_product(string memory _name, uint _cost) public payable returns (uint)",
        "function get_manner(address _addr) public view returns (uint)"
    ]

    async function updateLocation() {
        const accessToken = localStorage.getItem("accessToken");
        if (location == "") {
            alert("주소를 입력하세요.");
            return;
        }
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/updateLocation`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ location })
        });
        if (res.status == 201) {
            alert("주소가 수정되었습니다.");
            setLocation("");
            setUpdated(updated + 1);
        }
    }

    async function createTransaction(product: ProductPost) {

        // assert 대용
        if (product.status !== "matched") {
            alert("Invalid product state");
            return;
        }

        function get_fee(manner: number, cost: number) {
            return (200 + 10 - manner) * cost * 0.001 * 0.001 * 0.001 * 0.01;
        }

        if (!window.ethereum) {
            alert("지갑을 연결해주세요.");
            return;
        }

        const account = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = account[0];
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const contract = new Contract(contractAddress, abi, signer);
        let manner = null;
        try {
            manner = await contract.get_manner(address);
        } catch (err) {
            alert("Can't get manner");
            return;
        }

        const fee = get_fee(manner, product.cost);

        try {
            const tx = await contract.create_new_product(`test_${product.id}`, product.cost, {
                value: ethers.parseEther(`${fee}`)
            });

            const id = await tx.wait();
            alert(`새 컨트랙트가 생성되었습니다. id=${id}`);

            const accessToken = localStorage.getItem("accessToken");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/setStatus`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: "processing" })
            });
        } catch (err) {
            console.log(err);
            alert("스마트 컨트랙트 생성 에러");
            return;
        }
    }

    async function updateWallet() {
        if (typeof window.ethereum === "undefined") {
            alert("MetaMask를 설치해주세요.");
            return;
        }

        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const wallet: string = accounts[0];
            const accessToken = localStorage.getItem("accessToken");

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/updateWallet`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ wallet })
            })

            const data = await res.json();
            console.log(data);

            if (res.status === 201) {
                alert("지갑 주소가 성공적으로 등록되었습니다.");
                setUpdated(updated + 1);
            } else {
                alert("지갑 주소 등록 실패");
            }
        } catch (err) {
            alert("지갑 등록 중 오류가 발생했습니다.");
        }
    }

    // useEffect 안에서는 await를 직접 쓸 수 없음.
    useEffect(() => {
        // 여기에 API 요청해서 유저 정보 및 거래내역 받아오는 코드 작성하면 됨

        const fetchUser = async () => {
            const token = localStorage.getItem("accessToken");

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/getUser`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const userdata = await res.json();
            console.log(userdata);

            setUser({
                name: userdata.name,
                walletAddress: userdata.wallet,
                shippingAddress: userdata.location
            });

            setMyTrades(userdata.trade_offers);

            setMyProducts(userdata.products);
        };
        fetchUser();
    }, [updated]);

    async function deleteOffer(id: number) {
        const accessToken = localStorage.getItem("accessToken");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trade-offer/remove/${id}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })

        const data = await res.json();
        if (res.status == 201) {
            alert("거래 신청 내역이 삭제되었습니다.");
            setUpdated(updated + 1);
        }
    }

    async function deposit() {

    }

    async function cancelAcceptedTrade() {

    }

    async function finishTrade() {

    }

    async function cancelProduct() {

    }

    if (!user) return <div>로딩 중...</div>;

    return (
        <div className="p-6 space-y-8">
            <h1 className="text-2xl font-bold">마이페이지</h1>
            <Button onClick={() => router.push("/")}>홈으로 이동</Button>

            {/* 유저 정보 */}
            <Card>
                <CardContent className="space-y-4 pt-6">
                    <div><strong>이름:</strong> {user.name}</div>
                    <div className="flex items-center gap-2">
                        <strong>지갑주소:</strong> {user.walletAddress || "등록 안됨"}
                        <Button size="sm" onClick={() => updateWallet()}>{user.walletAddress ? "변경" : "등록"}</Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <strong>주소:</strong> {user.shippingAddress || "등록 안됨"}
                        <Input type="text" placeholder="변경할 주소" className="w-full max-w-md" value={location} onChange={(e) => setLocation(e.target.value)}>
                        </Input>
                        <Button size="sm" onClick={() => updateLocation()}>{user.shippingAddress ? "변경" : "등록"}</Button>
                    </div>
                </CardContent>
            </Card>

            {/* 내가 신청한 거래 내역 */}
            <div>
                <h2 className="text-xl font-semibold mb-2">내 거래 신청 내역</h2>
                <div className="space-y-2">
                    {myTrades.map((t) => (
                        <Card key={t.id}>
                            <CardContent className="pt-4 flex items-center justify-between">
                                <div>
                                    <div><strong>상품:</strong> {t.product.title}</div>
                                    <div><strong>제시 가격:</strong> {t.cost}</div>
                                    <div><strong>상태:</strong> {t.accepted}</div>
                                    <div><strong>상품 상태:</strong> {t.product.status}</div>
                                </div>

                                <div>
                                    {t.accepted && t.product.status === ProductStatus.MATCHED ? (
                                        <>
                                            <div className="flex gap-2">
                                                <Button onClick={() => router.push(`/product/${t.product.id}`)}>상품으로 이동하기</Button>
                                                <Button onClick={() => cancelAcceptedTrade()}>취소하기</Button>
                                            </div>
                                        </>
                                    ) : t.accepted && t.product.status === ProductStatus.PENDING ? (
                                        <>
                                            <div className="flex gap-2">
                                                <Button onClick={() => deposit()}>입금하기</Button>
                                                <Button onClick={() => router.push(`/product/${t.product.id}`)}>상품으로 이동하기</Button>
                                                <Button onClick={() => cancelAcceptedTrade()}>취소하기</Button>
                                            </div>
                                        </>
                                    ) : t.accepted && t.product.status === ProductStatus.PROCESSING ? (
                                        <>
                                            <div className="flex gap-2">
                                                <Button onClick={() => router.push(`/product/${t.product.id}`)}>상품으로 이동하기</Button>
                                                <Button onClick={() => cancelAcceptedTrade()}>취소하기</Button>
                                            </div>
                                        </>
                                    ) : t.accepted && t.product.status === ProductStatus.SHIPPING ? (
                                        <>
                                            <div className="flex gap-2">
                                                <Button onClick={() => finishTrade()}>수신 확인 / 정산</Button>
                                                <Button onClick={() => router.push(`/product/${t.product.id}`)}>상품으로 이동하기</Button>
                                                <Button onClick={() => cancelAcceptedTrade()}>취소하기</Button>
                                            </div>
                                        </>
                                    ) : t.accepted && t.product.status === ProductStatus.FINISHED ? (
                                        <>
                                            <div className="flex gap-2">
                                                <strong>거래가 종료되었습니다.</strong>
                                                <Button onClick={() => router.push(`/product/${t.product.id}`)}>상품으로 이동하기</Button>
                                            </div>
                                        </>
                                    ) : !t.accepted ? (
                                        <div>
                                            <strong>상품아 거절되었습니다.</strong>
                                        </div>
                                    ) : (
                                        // waiting...
                                        <>
                                            <div className="flex gap-2">
                                                <Button onClick={() => router.push(`/product/${t.product.id}`)}>상품으로 이동하기</Button>
                                                <Button onClick={() => deleteOffer(t.id)}>삭제하기</Button>
                                            </div>
                                        </>

                                    )}
                                </div>


                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* 내가 작성한 상품 글 */}
            <div>
                <h2 className="text-xl font-semibold mb-2">내 상품 게시글</h2>
                <div className="space-y-2">
                    {myProducts.map((p) => (
                        <Card key={p.id}>
                            <CardContent className="pt-4 flex items-center justify-between">
                                <div>
                                    <div><strong>상품:</strong> {p.title}</div>
                                    <div><strong>가격:</strong> {p.cost}</div>
                                    <div><strong>작성일:</strong> {p.created_at}</div>
                                    <div><strong>상태:</strong> {p.status}</div>
                                    {p.buyer && (
                                        <div><strong>구매자:</strong> {p.buyer.name}</div>
                                    )}
                                </div>
                                <div>
                                    {p.trade_offers.length > 0 && p.status == ProductStatus.FINDING ? (
                                        <>
                                            <div>
                                                <strong>새 거래 신청이 </strong> {p.trade_offers.filter((offer) => offer.accepted == "pending").length}<strong>건 있습니다.</strong>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button onClick={() => router.push(`/tradeOffers?productId=${p.id}`)}>거래 신청내역 보기</Button>
                                                <Button onClick={() => router.push(`/product/${p.id}`)}>이동하기</Button>
                                                <Button onClick={() => cancelProduct()}>삭제하기</Button>
                                            </div>
                                        </>
                                    ) : p.status === ProductStatus.MATCHED ? (
                                        <>
                                            <div className="flex gap-2">
                                                <Button onClick={() => createTransaction(p)}>스마트 컨트랙트 등록하기</Button>
                                                <Button onClick={() => cancelProduct()}>삭제하기</Button>
                                                <Button onClick={() => router.push(`/product/${p.id}`)}>이동하기</Button>
                                            </div>
                                        </>
                                    ) : p.status === ProductStatus.PENDING ? (
                                        <>
                                            <div className="flex gap-2">
                                                <Button onClick={() => cancelAcceptedTrade()}>취소하기</Button>
                                                <Button onClick={() => router.push(`/product/${p.id}`)}>이동하기</Button>
                                            </div>
                                        </>
                                    ) : p.status === ProductStatus.PROCESSING ? (
                                        <>
                                            <div className="flex gap-2">
                                                <Button onClick={() => router.push(`/product/${p.id}`)}>이동하기</Button>
                                                <Button onClick={() => cancelAcceptedTrade()}>취소하기</Button>
                                                <Button onClick={() => router.push(`/product/${p.id}`)}>이동하기</Button>
                                            </div>
                                        </>
                                    ) : p.status === ProductStatus.SHIPPING ? (
                                        <>
                                            <div className="flex gap-2">
                                                <Button onClick={() => cancelAcceptedTrade()}>취소하기</Button>
                                                <Button onClick={() => router.push(`/product/${p.id}`)}>이동하기</Button>
                                            </div>
                                        </>
                                    ) : p.status === ProductStatus.FINISHED ? (
                                        <>
                                            <div className="flex gap-2">
                                                <strong>거래가 종료되었습니다.</strong>
                                                <Button onClick={() => router.push(`/product/${p.id}`)}>이동하기</Button>
                                            </div>
                                        </>
                                    ) : (
                                        <Button onClick={() => router.push(`/product/${p.id}`)}>이동하기</Button>
                                    )}

                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div >
    );
}
