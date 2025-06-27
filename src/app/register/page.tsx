"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation"
import { useState } from "react";

export default function LoginPage() {
    const router = useRouter();
    const [id, setId] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("")

    async function register() {
        if (id === "" || password === "") {
            alert("입력란을 입력하세요.");
            return;
        }

        if (password !== passwordConfirm) {
            alert("비밀번호가 다릅니다.");
            return;
        }
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                // TODO: 이거 필수네..
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: id,
                password: password
            })
        })

        const data = await res.json();
        if (data.error) {
            alert("회원가입 실패");
        } else {
            alert("회원가입 성공! 로그인 페이지로 돌아갑니다.");
            router.push('/login');
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-sm space-y-4">
                <h1 className="text-2xl font-bold text-center">회원가입</h1>
                <Input type="id" onChange={(e) => setId(e.target.value)} placeholder="아이디" />
                <Input type="password" onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호" />
                <Input type="password" onChange={(e) => setPasswordConfirm(e.target.value)} placeholder="비밀번호 확인" />
                <Button className="w-full" onClick={() => register()}>
                    회원가입
                </Button>
                <Button className="w-full" onClick={() => router.push("/login")}>
                    로그인 화면으로 돌아가기
                </Button>
                <Button className="w-full" onClick={() => router.push("/")}>
                    메인화면으로 돌아가기
                </Button>
            </div>
        </div>
    );
}
