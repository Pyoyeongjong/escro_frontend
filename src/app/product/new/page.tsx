'use client';

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Router } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
    const [title, setTitle] = useState("");
    const [cost, setCost] = useState("");
    const [description, setDescription] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const router = useRouter();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 3) {
            alert("이미지는 최대 3개까지만 업로드 가능합니다.");
            return;
        }
        setImages(files);
    };

    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("cost", cost);
        console.log(cost);
        formData.append("description", description);
        images.forEach((img, idx) => {
            formData.append("image", img); // 서버에서 multiple 처리
        });

        const token = localStorage.getItem("accessToken");

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/create`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        console.log(await res.json());
        if (res.ok) {
            alert("상품 등록 완료!");
            router.push('/');
        } else {
            alert("상품 등록 실패");
        }
    };

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold">상품 등록</h1>

            <Input
                type="text"
                placeholder="제목"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <Input
                type="number"
                placeholder="가격"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
            />
            <Textarea
                placeholder="상품 설명"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            <Input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
            />
            {images.length > 0 && (
                <div className="flex gap-2">
                    {images.map((img, idx) => (
                        <div key={idx} className="w-20 h-20 overflow-hidden rounded border">
                            <img
                                src={URL.createObjectURL(img)}
                                alt="preview"
                                className="object-cover w-full h-full"
                            />
                        </div>
                    ))}
                </div>
            )}
            <div className="flex gap-2">
                <Button onClick={handleSubmit}>등록하기</Button>
                <Button onClick={() => router.push('/')}>홈으로 돌아가기</Button>
            </div>
        </div >
    );
}
