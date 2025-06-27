"use client";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";

interface Product {
  id: number;
  title: string;
  description: string;
  images?: { id: number; image_url: string }[];
  replies: {
    id: number; created_at: string; description: string;
    user: { name: string };
  }[];
  cost: string;
  createdBy: { name: string };
  trade_offers: { id: number }[];
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [reply, setReply] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isUsers, setIsUsers] = useState(true);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const accessToken = localStorage.getItem("accessToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/getProduct/${id}`);
      const data = await res.json();
      console.log(data);
      setProduct(data);

      const res2 = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/getUser`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },

      });
      const data2 = await res2.json();
      console.log(data2);
      if (res.status != 200) {
        return;
      }
      setUsername(data2.name);

      console.log(product);
      console.log(username);

      if (data.createdBy.name === data2.name) {
        setIsUsers(true);
      } else {
        setIsUsers(false);
      }
    }

    fetchData();

  }, [refreshTrigger]);

  async function createReply() {
    const accessToken = localStorage.getItem("accessToken");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/${id}/addReply`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ description: reply })
    });

    if (res.status === 401) {
      alert("로그인이 필요합니다.");
      return;
    }
    alert("댓글이 작성되었습니다.");
    setRefreshTrigger(prev => prev + 1);
  }

  async function removeProduct() {
    const accessToken = localStorage.getItem("accessToken");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/remove/${id}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log(res);
    if (res.status == 201) {
      alert("게시물 삭제 성공");
      router.push('/');
    } else {
      alert("게시물을 삭제할 수 없습니다.");
      return;
    }
  }

  if (!product) {
    return (
      <div className="w-full h-screen flex justify-center items-center text-gray-500">
        상품 정보를 불러오는 중...
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6 relative">
      {/* 뒤로가기 버튼 */}
      <Button variant="outline" onClick={() => router.back()}>
        ← 뒤로가기
      </Button>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{product.title}</h1>
        {isUsers && (
          <>
            <Button className="absolute top-6 right-2" onClick={() => removeProduct()}>
              게시물 삭제
            </Button>
          </>
        )}
      </div>

      {/* 상품 이미지 */}
      {product.images && product.images.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {product.images.map((img) => (
            <img
              key={img.id}
              src={img.image_url}
              alt={product.title}
              className="w-full h-64 object-contain rounded-lg bg-gray-100"
            />
          ))}
        </div>
      )}

      {/* 상품 설명 */}
      <p className="text-gray-700">{product.description}</p>

      {/* 가격 */}
      <p className="text-lg font-semibold text-blue-600">{product.cost}</p>

      <span>거래 신청 글이 {product.trade_offers.length} 개 있습니다.</span>

      {/* 거래 신청 버튼 */}
      <Button className="w-full" onClick={() => router.push(`/apply/new?productId=${id}`)}>
        거래 신청
      </Button>

      {/* 댓글 */}
      <div className="space-y-2">
        <h2 className="font-semibold">댓글</h2>
        <Textarea onChange={(e) => setReply(e.target.value)} placeholder="댓글을 입력하세요" />
        <Button onClick={() => createReply()}>댓글 작성</Button>

        {/* 예시 댓글 */}
        <div className="mt-4 space-y-2">
          {product.replies.map((reply) => (
            <div key={reply.id} className="bg-gray-100 p-2 rounded">
              {reply.user.name}: {reply.description} | {reply.created_at}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
