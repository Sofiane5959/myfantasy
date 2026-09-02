import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions d'utilisation — MyFantasy",
};

export default function CguPage() {
  return (
    <>
      <h1>Conditions générales d&apos;utilisation</h1>

      <h2>Accès au service</h2>
      <p>
        Le service est strictement réservé aux personnes majeures. L&apos;âge
        est aujourd&apos;hui <strong>déclaratif</strong> : la date de naissance
        saisie est contrôlée par la base de données, mais aucune pièce
        justificative n&apos;est demandée. Un dispositif de vérification
        d&apos;âge conforme doit être mis en place avant toute ouverture au
        public.
      </p>

      <h2>Consentement et sécurité</h2>
      <ul>
        <li>
          Aucun contact n&apos;est possible sans invitation acceptée par les
          deux personnes.
        </li>
        <li>
          Chaque conversation dispose d&apos;un safe word modifiable, dont le
          respect relève des personnes concernées.
        </li>
        <li>
          Les limites dures déclarées sont privées et n&apos;engagent que leur
          autrice.
        </li>
      </ul>

      <h2>Comportements interdits</h2>
      <ul>
        <li>Usurpation d&apos;identité, fausse déclaration d&apos;âge.</li>
        <li>Harcèlement, menace, diffusion de contenu non consenti.</li>
        <li>Captation ou rediffusion des échanges hors du service.</li>
        <li>Sollicitation commerciale ou prostitutionnelle.</li>
      </ul>

      <h2>À compléter avant mise en production</h2>
      <ul>
        <li>Identité de l&apos;éditeur et mentions légales obligatoires.</li>
        <li>Procédure de signalement et de modération, délais de traitement.</li>
        <li>Conditions de suspension et de suppression de compte.</li>
        <li>Droit applicable, juridiction compétente, médiation à la consommation.</li>
        <li>Conditions tarifaires si une offre payante est introduite.</li>
      </ul>
    </>
  );
}
