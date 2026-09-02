import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité — MyFantasy",
};

export default function ConfidentialitePage() {
  return (
    <>
      <h1>Politique de confidentialité</h1>

      <h2>Données collectées</h2>
      <ul>
        <li>Adresse email (authentification par lien à usage unique).</li>
        <li>Prénom ou pseudonyme, date de naissance.</li>
        <li>
          Catégories de désirs, intensité, rôle, personnes recherchées, note de
          présentation.
        </li>
        <li>Limites dures, stockées séparément.</li>
        <li>Invitations, matchs et messages échangés.</li>
      </ul>

      <h2>Nature des données</h2>
      <p>
        Les préférences déclarées constituent des données relatives à la vie
        sexuelle, soumises à l&apos;article 9 du RGPD. Leur traitement repose
        sur le consentement explicite, retirable à tout moment par la
        suppression du compte.
      </p>

      <h2>Qui voit quoi</h2>
      <ul>
        <li>
          <strong>Avant match mutuel :</strong> les autres personnes ne voient
          ni ton prénom, ni ton email, ni ta date de naissance — uniquement ton
          âge, ton rôle, ton intensité et tes catégories. Cette restriction est
          appliquée par la base de données, pas par l&apos;interface.
        </li>
        <li>
          <strong>Après match mutuel :</strong> ton prénom devient visible par
          la personne concernée uniquement.
        </li>
        <li>
          <strong>Jamais :</strong> tes limites dures ne sont lisibles que par
          toi, y compris après un match.
        </li>
        <li>
          Tant que ton profil n&apos;est pas activé, il n&apos;apparaît dans
          aucun résultat.
        </li>
      </ul>

      <h2>Chiffrement</h2>
      <p>
        Les données sont chiffrées en transit (HTTPS) et au repos par
        l&apos;hébergeur de la base. <strong>Il n&apos;y a pas de chiffrement
        de bout en bout :</strong> l&apos;exploitant peut techniquement accéder
        au contenu des messages. Toute communication affirmant le contraire
        serait inexacte.
      </p>

      <h2>À compléter avant mise en production</h2>
      <ul>
        <li>Identité et coordonnées du responsable de traitement.</li>
        <li>Hébergeur, localisation des données, transferts hors UE.</li>
        <li>Durées de conservation par catégorie de données.</li>
        <li>
          Procédure d&apos;exercice des droits (accès, rectification,
          effacement, portabilité, opposition) et délai de réponse.
        </li>
        <li>Coordonnées du DPO le cas échéant, et voie de recours CNIL.</li>
        <li>Sous-traitants et cookies éventuels.</li>
      </ul>
    </>
  );
}
