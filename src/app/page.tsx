"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function ProductCard({ id, title, price, img_url }: { id: number, title: string; price: string; img_url: string }) {
  const router = useRouter();
  const handleClick = () => router.push(`/product/${id}`);

  return (
    <div
      onClick={handleClick}
      className="border rounded-xl p-4 shadow-md cursor-pointer relative hover:ring hover:ring-blue-300"
    >
      <img
        src={img_url || "http://localhost:3001/uploads/default.jpg"}
        alt={title}
        className="h-64 w-full object-cover rounded mb-2"
      />
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-gray-500">{price}</div>
      <div className="absolute bottom-2 right-2 flex gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            alert("좋아요");
          }}
        >
          ❤️
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            alert("신고하기");
          }}
        >
          🚨
        </Button>
      </div>
    </div>
  );
}

interface Product {
  id: number;
  title: string;
  cost: string;
  images: { image_url: string }[];
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();
  const [isLoggedOut, setIsLoggedOut] = useState(0);
  const [username, setUsername] = useState("");

  const [products, setProducts] = useState<Product[]>([]);

  async function LogOut() {
    localStorage.setItem("accessToken", "");
    alert("로그아웃 완료!");
    setIsLoggedOut(isLoggedOut + 1);
  }

  // Hydration Effect
  // SSR 렌더링과 초기 랜더링 사이 불일치로 인해 React가 재생성 하고 있다는 뜻
  useEffect(() => {
    const verify_accessToken = async () => {
      const accessToken = localStorage.getItem("accessToken");
      console.log(accessToken);
      if (!accessToken) {
        setIsLoggedIn(false);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verifyAccessToken`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const data = await res.json();

      if (data.error) {
        setIsLoggedIn(false);
      } else {
        setIsLoggedIn(true);
        setUsername(data.username);
      }
    }
    verify_accessToken();
  }, [isLoggedOut])

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/getProducts?page=1&limit=10`);
      const data = await res.json();

      setProducts(data.data);
    };
    fetchProducts();
  }, [])

  if (isLoggedIn === null) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-gray-500">
        로그인 상태 확인 중...
      </div>
    );
  }





  // ewruen 아늬 JS 서버 사이드 렌더링 어떻게 해결함??
  return (
    <div>
      <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50 h-16 flex items-center justify-between px-4">
        <div className="flex-1 flex justify-center gap-4">
          <Input
            type="text"
            placeholder="검색어를 입력하세요"
            className="w-full max-w-md"
          />
          <Button onClick={() => alert("검색 기능 준비 중..")}>검색</Button>
        </div>

        <div className="flex gap-2 items-center">
          <Button onClick={() => router.push('/product/new')}>상품 등록</Button>
          {isLoggedIn ? (
            <>
              <Button onClick={() => router.push("/mypage")}>마이페이지</Button>
              <span>안녕하세요, {username}님!</span>
              <Avatar>
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <Button onClick={() => LogOut()}>로그아웃</Button>
            </>
          ) : (
            <Button onClick={() => router.push('/login')}>로그인</Button>
          )}
        </div>
      </header>

      <main className="pt-20 px-4">
        <h1 className="text-2xl font-bold mb-4 px-6">중고거래 상품 목록</h1>
        <div className="grid grid-cols-2 gap-4 px-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              price={product.cost}
              img_url={product.images[0]?.image_url}
            />
          ))}
        </div>

        {/* 페이징 버튼 */}
        <div className="flex justify-center mt-8 gap-2 mb-12">
          {[1, 2, 3, 4, 5].map((page) => (
            <Button key={page} variant="outline">
              {page}
            </Button>
          ))}
        </div>
      </main>
    </div>
  );
}
