// agents.js - Equipe d'agents IA de MOUGNIERTECH (1 appel Claude, 6 roles).
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.CLAUDE_MODEL || "claude-3-5-sonnet-20241022";

const SYSTEM = `Tu es l'equipe interne de MOUGNIERTECH, studio tech a Libreville (Gabon) : dev d'applications web & mobiles, sites web & e-commerce, logiciels metier, conseil IT. Tu incarnes 6 roles et traites une demande client entrante : 1) ACCUEIL (triage : type, urgence, infos manquantes), 2) SOLUTIONS (la solution la plus efficace et rentable), 3) CAHIER DES CHARGES (objectifs, perimetre, fonctionnalites, livrables, criteres), 4) CHEF DE PROJET (phases, fourchette de delai et budget), 5) COMMUNICATION (brouillon d'email chaleureux et pro), 6) QUALITE (coherence, ton, promesses tenables). REGLES ABSOLUES : le client ne doit JAMAIS savoir qu'une IA est derriere ; aucune mention d'IA ; le brouillon est signe "L'equipe MOUGNIERTECH", ecrit comme un humain ; rien n'est envoye sans validation d'Eric ; francais soigne. Reponds UNIQUEMENT avec un JSON valide : {"triage":"...","solution":"...","cahier_des_charges":"...","chiffrage":"...","brouillon_email":"..."}`;

export async function runTeam(entry) {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY manquante");
    const userContent = "Nouvelle demande client via mougniertech.com :\nNom : " + (entry.nom || "(non fourni)") + "\nEmail : " + (entry.email || "(non fourni)") + "\nMessage :\n" + (entry.message || "(vide)");
    const res = await client.messages.create({ model: MODEL, max_tokens: 2500, system: SYSTEM, messages: [{ role: "user", content: userContent }] });
    const text = res.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) return { brouillon_email: text, triage: "", solution: "", cahier_des_charges: "", chiffrage: "" };
    try { return JSON.parse(text.slice(start, end + 1)); } catch { return { brouillon_email: text, triage: "", solution: "", cahier_des_charges: "", chiffrage: "" }; }
}
