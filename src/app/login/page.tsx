"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation"
import { useState } from "react";

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSignin = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            if (res.ok) {
                alert("로그인 성공! 메인 페이지로 이동합니다.");
                const data = await res.json();
                localStorage.setItem("accessToken", data.accessToken);
                localStorage.setItem("refreshToken", data.accessToken);
                router.push("/");
            } else {
                const error = await res.json();
                alert("로그인 실패: " + error.message);
            }
        } catch (err) {
            alert("서버 요청 실패: " + err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-sm space-y-4">
                <h1 className="text-2xl font-bold text-center">로그인</h1>
                <Input
                    type="id"
                    placeholder="아이디"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)} />
                <Input
                    type="password"
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} />
                <Button className="w-full" onClick={handleSignin}>
                    로그인
                </Button>
                <Button className="w-full" onClick={() => router.push("/register")}>
                    회원가입
                </Button>
                <Button className="w-full" onClick={() => router.push("/")}>
                    메인화면으로 돌아가기
                </Button>
            </div>
        </div>
    );
}
