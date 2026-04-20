"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { authClient } from "~/server/better-auth/client";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export default function InscriptionPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await authClient.signUp.email({ name, email, password });

    if (result.error) {
      setError(result.error.message ?? "Erreur lors de l'inscription");
      setLoading(false);
      return;
    }

    router.push("/tableau-de-bord");
  };

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">
        Creer un compte
      </h1>
      <p className="mt-1.5 text-[13px] text-muted-foreground">
        Commencez votre preparation aux concours post-bac.
      </p>

      <form onSubmit={handleRegister} className="mt-8 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-[13px]">
            Nom complet
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Votre nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-[13px]">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-[13px]">
            Mot de passe
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Minimum 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-[13px] text-destructive">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creation..." : "Creer un compte"}
        </Button>
      </form>

      <p className="mt-8 text-center text-[13px] text-muted-foreground">
        Deja un compte ?{" "}
        <Link
          href="/connexion"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}
