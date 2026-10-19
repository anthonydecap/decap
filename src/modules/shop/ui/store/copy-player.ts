/**
 * Player-aware storefront copy (en / fr): "Buying music for", licensed states, cart groups,
 * checkout explanations. Customer language only: "Licensed for <player>", never internal
 * words or enum values. No em or en dashes.
 */

const en = {
  // Shopping context bar
  buyingFor: "Buying music for",
  player: "Player",
  choosePlayer: "Choose a player",
  playerMeta: (type: string, masked: string) => `${type} · ${masked}`,
  noPlayerNotice: "Music is activated for a registered Virtual Orchestrion. You do not have one yet.",
  howLicensingWorks: "How music licensing works",
  downloadDmiPlayer: "Download Virtual Orchestrion",
  saving: "Saving",

  // Player choice dialog
  whichPlayerTitle: "Which player is this music for?",
  whichPlayerBody: "Each music license is activated for one registered player.",
  continue: "Continue",
  cancel: "Cancel",
  close: "Close",

  // Cards
  licensed: "Licensed",
  forThisPlayer: (price: string) => `${price} for this player`,
  notForThisPlayer: "Not available for this player",
  add: "Add",
  inCart: "In cart",

  // Arrangement page
  licensingOneLine: "Music licenses are activated for one registered DMI player.",
  signInToBuy: "Sign in to buy",
  forLabel: "For",
  licensedFor: (name: string) => `Licensed for ${name}`,
  viewInMyMusic: "View in My Music",
  licensedOn: "Licensed on",
  addTo: (name: string) => `Add to ${name}`,
  additionalPrice: "Additional-player price",
  addToThisPlayer: "Add to this player",
  addToAnotherPlayer: "Add to another player",
  notAvailableFor: (name: string) => `This arrangement is not available for ${name}.`,
  noPlayerTitle: "You need a registered Virtual Orchestrion before this music can be activated.",
  haveDmiPlayer: "Already have Virtual Orchestrion?",
  viewMySoftware: "View My Software and registration",
  needSoftware: "Need the player software?",
  preferBuyNow: "Prefer to buy now?",
  buyNowAssignLater: "Buy now, assign later",
  boughtForLater: "You already bought this. It will be activated for your first registered Virtual Orchestrion.",
  chooseToSeePrice: "Choose a player to see your price.",
  tagLicensed: "licensed",
  tagNotAvailable: "not available",

  // Collection page
  arrangementsCount: (n: number) => (n === 1 ? "1 arrangement" : `${n} arrangements`),
  alreadyLicensed: (n: number) => `${n} already licensed`,
  willBeAdded: (n: number) => `${n} will be added`,
  notAvailableCount: (n: number) => `${n} not available for this player`,
  regularRemainingValue: "Regular remaining value",
  yourCollectionPrice: "Your collection price",
  additionalNote: (n: number) =>
    n === 1
      ? "1 of these is already licensed on another of your players and uses the additional-player price."
      : `${n} of these are already licensed on another of your players and use the additional-player price.`,
  completeCollection: "Complete collection",
  collectionAllLicensed: (name: string) => `${name} already has every arrangement in this collection.`,
  collectionAllBought: "You already bought every arrangement in this collection.",
  collectionNotAvailable: (name: string) => `This collection is not available for ${name}.`,
  itemNotAvailable: "Not available",
  collectionUnavailable: "This collection is not available right now.",

  // Cart
  forPlayer: (name: string) => `For ${name}`,
  assignLater: "Assign later",
  assignLaterBody: "These licenses wait in your account until you register a Virtual Orchestrion.",
  needsPlayer: "Choose a player",
  needsPlayerBody: "Pick the player each item is for before you check out.",
  thisMusicIsFor: "This music is for",
  softwareGroup: "Software",
  additionalBadge: "Additional-player price",
  additionalInCollection: (n: number) => `${n} at the additional-player price`,
  removedOwnedFor: (name: string) => `Already licensed for ${name}. Removed from your cart.`,
  removedIncompatible: (name: string) => `Not available for ${name}. Removed from your cart.`,
  removedPlayerUnavailable: "The player it was for can no longer receive music. Removed from your cart.",
  choosePlayersFirst: "Choose a player for every item to continue to checkout.",
  thisPlayer: "this player",

  // Checkout
  licenseIsFor: (name: string) => `This music license is for ${name}. It can be delivered for this registered player.`,
  assignLaterExplain: "These licenses stay in your account until you register a Virtual Orchestrion.",
  notCharged: "Not charged",
  alreadyLicensedFor: (name: string) => `Already licensed for ${name}`,
  collectionPartlyLicensed: (n: number) => `${n} already licensed, not charged`,
  playerRequiredError: "Some items in your cart still need a player. Choose one in your cart, then check out.",
  freeOrder: "Nothing to pay. Confirming your order",

  // Order complete
  completeDone: "Your music is licensed and ready for your player.",
  completePending: "Payment received. We are adding the music to your player.",
  openPlayerMusic: (name: string) => `Open music on ${name}`,
  goToMyMusic: "Go to My Music",
  myMusic: "My Music",
};

export type PlayerCopy = typeof en;

const fr: PlayerCopy = {
  buyingFor: "Musique pour",
  player: "Lecteur",
  choosePlayer: "Choisir un lecteur",
  playerMeta: (type, masked) => `${type} · ${masked}`,
  noPlayerNotice: "La musique est activée pour un Virtual Orchestrion enregistré. Vous n'en avez pas encore.",
  howLicensingWorks: "Comment fonctionnent les licences musicales",
  downloadDmiPlayer: "Télécharger Virtual Orchestrion",
  saving: "Enregistrement",

  whichPlayerTitle: "Pour quel lecteur est cette musique ?",
  whichPlayerBody: "Chaque licence musicale est activée pour un seul lecteur enregistré.",
  continue: "Continuer",
  cancel: "Annuler",
  close: "Fermer",

  licensed: "Sous licence",
  forThisPlayer: (price) => `${price} pour ce lecteur`,
  notForThisPlayer: "Non disponible pour ce lecteur",
  add: "Ajouter",
  inCart: "Dans le panier",

  licensingOneLine: "Les licences musicales sont activées pour un seul Virtual Orchestrion enregistré.",
  signInToBuy: "Se connecter pour acheter",
  forLabel: "Pour",
  licensedFor: (name) => `Sous licence pour ${name}`,
  viewInMyMusic: "Voir dans Ma musique",
  licensedOn: "Sous licence sur",
  addTo: (name) => `Ajouter à ${name}`,
  additionalPrice: "Prix lecteur supplémentaire",
  addToThisPlayer: "Ajouter à ce lecteur",
  addToAnotherPlayer: "Ajouter à un autre lecteur",
  notAvailableFor: (name) => `Cet arrangement n'est pas disponible pour ${name}.`,
  noPlayerTitle: "Il vous faut un Virtual Orchestrion enregistré pour activer cette musique.",
  haveDmiPlayer: "Vous avez déjà Virtual Orchestrion ?",
  viewMySoftware: "Voir Mes logiciels et l'enregistrement",
  needSoftware: "Besoin du logiciel de lecture ?",
  preferBuyNow: "Vous préférez acheter maintenant ?",
  buyNowAssignLater: "Acheter maintenant, attribuer plus tard",
  boughtForLater: "Vous avez déjà acheté ceci. Il sera activé pour votre premier Virtual Orchestrion enregistré.",
  chooseToSeePrice: "Choisissez un lecteur pour voir votre prix.",
  tagLicensed: "sous licence",
  tagNotAvailable: "non disponible",

  arrangementsCount: (n) => (n === 1 ? "1 arrangement" : `${n} arrangements`),
  alreadyLicensed: (n) => `${n} déjà sous licence`,
  willBeAdded: (n) => `${n} seront ajoutés`,
  notAvailableCount: (n) => `${n} non disponibles pour ce lecteur`,
  regularRemainingValue: "Valeur normale restante",
  yourCollectionPrice: "Votre prix pour la collection",
  additionalNote: (n) =>
    n === 1
      ? "1 de ces arrangements est déjà sous licence sur un autre de vos lecteurs et bénéficie du prix lecteur supplémentaire."
      : `${n} de ces arrangements sont déjà sous licence sur un autre de vos lecteurs et bénéficient du prix lecteur supplémentaire.`,
  completeCollection: "Compléter la collection",
  collectionAllLicensed: (name) => `${name} a déjà tous les arrangements de cette collection.`,
  collectionAllBought: "Vous avez déjà acheté tous les arrangements de cette collection.",
  collectionNotAvailable: (name) => `Cette collection n'est pas disponible pour ${name}.`,
  itemNotAvailable: "Non disponible",
  collectionUnavailable: "Cette collection n'est pas disponible pour le moment.",

  forPlayer: (name) => `Pour ${name}`,
  assignLater: "À attribuer plus tard",
  assignLaterBody: "Ces licences restent dans votre compte jusqu'à l'enregistrement d'un Virtual Orchestrion.",
  needsPlayer: "Choisir un lecteur",
  needsPlayerBody: "Indiquez pour quel lecteur est chaque article avant de payer.",
  thisMusicIsFor: "Cette musique est pour",
  softwareGroup: "Logiciels",
  additionalBadge: "Prix lecteur supplémentaire",
  additionalInCollection: (n) => `${n} au prix lecteur supplémentaire`,
  removedOwnedFor: (name) => `Déjà sous licence pour ${name}. Retiré de votre panier.`,
  removedIncompatible: (name) => `Non disponible pour ${name}. Retiré de votre panier.`,
  removedPlayerUnavailable: "Le lecteur prévu ne peut plus recevoir de musique. Retiré de votre panier.",
  choosePlayersFirst: "Choisissez un lecteur pour chaque article pour passer au paiement.",
  thisPlayer: "ce lecteur",

  licenseIsFor: (name) => `Cette licence musicale est pour ${name}. Elle peut être livrée pour ce lecteur enregistré.`,
  assignLaterExplain: "Ces licences restent dans votre compte jusqu'à l'enregistrement d'un Virtual Orchestrion.",
  notCharged: "Non facturé",
  alreadyLicensedFor: (name) => `Déjà sous licence pour ${name}`,
  collectionPartlyLicensed: (n) => `${n} déjà sous licence, non facturés`,
  playerRequiredError: "Certains articles de votre panier n'ont pas encore de lecteur. Choisissez-le dans votre panier, puis payez.",
  freeOrder: "Rien à payer. Confirmation de votre commande",

  completeDone: "Votre musique est sous licence et prête pour votre lecteur.",
  completePending: "Paiement reçu. Nous ajoutons la musique à votre lecteur.",
  openPlayerMusic: (name) => `Voir la musique de ${name}`,
  goToMyMusic: "Voir Ma musique",
  myMusic: "Ma musique",
};

export function playerCopy(lang: string): PlayerCopy {
  return lang === "fr" ? fr : en;
}

/** Customer-facing links used by the player-aware storefront. */
export const playerLinks = {
  help: (lang: string) => `/${lang}/shop/help/music-licensing`,
  myMusic: (lang: string) => `/${lang}/shop/account/music`,
  playerMusic: (lang: string, playerId: string) => `/${lang}/shop/account/players/${playerId}/music`,
};
