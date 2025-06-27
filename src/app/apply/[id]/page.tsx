"use client";

import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

// 예시 상품 데이터 (추후 fetch로 대체 가능)
const productData = Array.from({ length: 10 }).map((_, i) => ({
  id: (i + 1).toString(),
  title: `상품 ${i + 1}`,
  price: `${(i + 1) * 10000}원`,
  description: `이것은 상품 ${i + 1}번의 설명입니다.`,
}));

export default function ApplyPage() {
  const { id } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");

  const product = productData.find((p) => p.id === id);

  const handleSubmit = () => {
    if (!title || !desc || !price) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    alert(`"${product?.title}"에 대한 거래 신청 완료!`);
    router.push(`/product/${id}`);
  };

  if (!product) {
    return <div className="p-4">상품을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">거래 신청 - {product.title}</h1>

      {/* 상품 요약 */}
      <div className="bg-gray-100 rounded p-3">
        <p><strong>제목:</strong> {product.title}</p>
        <p><strong>설명:</strong> {product.description}</p>
        <p><strong>가격:</strong> {product.price}</p>
      </div>

      {/* 신청 입력창 */}
      <Input
        placeholder="제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Textarea
        placeholder="상세 설명"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />
      <Input
        type="number"
        placeholder="제안 가격 (원)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <Button className="w-full" onClick={handleSubmit}>
        거래 신청하기
      </Button>

      <Button className="w-full" onClick={() => router.back()}>
        상품 상세페이지로 돌아가기
      </Button>
    </div>
  );
}