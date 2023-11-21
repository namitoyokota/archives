import { Rating } from "./rating";

export namespace SectionRatings {
  export const Low = new Rating(0, "Low", "green");
  export const Medium = new Rating(1, "Medium", "yellow");
  export const High = new Rating(2, "High", "orange");
  export const Severe = new Rating(3, "Severe", "red");
  export const NA = new Rating(4, "N/A", "gray");
}

export namespace OverallRatings {
  export const Confident = new Rating(0, "Confident", "green");
  export const Satisfactory = new Rating(1, "Satisfactory", "yellow");
  export const Cautious = new Rating(2, "Cautious", "orange");
  export const Vulnerable = new Rating(3, "Vulnerable", "red");
}
