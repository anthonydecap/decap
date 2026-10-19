/** Countries the shop sells to (ISO 3166-1 alpha-2). Safe for client and server. */
export const COUNTRIES: [string, string][] = [
  ["AT", "Austria"], ["AU", "Australia"], ["BE", "Belgium"], ["BG", "Bulgaria"], ["CA", "Canada"], ["CH", "Switzerland"],
  ["CY", "Cyprus"], ["CZ", "Czechia"], ["DE", "Germany"], ["DK", "Denmark"], ["EE", "Estonia"], ["ES", "Spain"],
  ["FI", "Finland"], ["FR", "France"], ["GB", "United Kingdom"], ["GR", "Greece"], ["HR", "Croatia"], ["HU", "Hungary"],
  ["IE", "Ireland"], ["IS", "Iceland"], ["IT", "Italy"], ["JP", "Japan"], ["LI", "Liechtenstein"], ["LT", "Lithuania"],
  ["LU", "Luxembourg"], ["LV", "Latvia"], ["MT", "Malta"], ["NL", "Netherlands"], ["NO", "Norway"], ["NZ", "New Zealand"],
  ["PL", "Poland"], ["PT", "Portugal"], ["RO", "Romania"], ["SE", "Sweden"], ["SI", "Slovenia"], ["SK", "Slovakia"],
  ["US", "United States"],
];

const NAMES = new Map(COUNTRIES);

export function countryName(code: string | null | undefined): string {
  if (!code) return "";
  return NAMES.get(code) ?? code;
}
