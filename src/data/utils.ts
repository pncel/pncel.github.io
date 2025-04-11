import { Person } from "./types";
export function composeFullName(person: Person) {
  const { firstname, goby, middlename, lastname } = person;
  const name = middlename ? `${firstname} ${middlename}` : firstname;
  if (goby) {
    return `${name} "${goby}" ${lastname}`;
  } else {
    return `${name} ${lastname}`;
  }
}

export function composeAvatarPlaceholder(person: Person) {
  const { firstname, goby, lastname } = person;
  const placeholder = [goby || firstname, lastname]
    .filter((s) => s !== undefined)
    .filter((s) => s) // make sure it's not an empty string
    .map((s) => s[0])
    .join("")
    .toUpperCase();
  return placeholder;
}

export const metadataTmpl = {
  title: "PᴺCEL",
  description:
    "PNCEL: {Programmable, Parallel, high-Performance, Power-efficient, ...} Computer Engineering Lab at University of Washington (UW)",
};
