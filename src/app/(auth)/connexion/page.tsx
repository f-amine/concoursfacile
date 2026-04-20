"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { authClient } from "~/server/better-auth/client";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export default function ConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await authClient.signIn.email({ email, password });

    if (result.error) {
      setError(result.error.message ?? "Erreur de connexion");
      setLoading(false);
      return;
    }

    router.push("/tableau-de-bord");
  };

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Connexion</h1>
      <p className="mt-1.5 text-[13px] text-muted-foreground">
        Entrez vos identifiants pour acceder a votre espace.
      </p>

      <form onSubmit={handleEmailLogin} className="mt-8 space-y-4">
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
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-[13px]">
            Mot de passe
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Votre mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-[13px] text-destructive">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Connexion..." : "Se connecter"}
        </Button>
      </form>

      <p className="mt-8 text-center text-[13px] text-muted-foreground">
        Pas encore de compte ?{" "}
        <Link
          href="/inscription"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Creer un compte
        </Link>
      </p>
    </div>
  );
}
