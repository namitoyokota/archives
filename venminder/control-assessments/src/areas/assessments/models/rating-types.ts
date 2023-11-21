import { RatingType } from "./rating-type";

export namespace RatingTypes {
  export const IncludeRiskProfile = new RatingType(
    true,
    "Include Risk Profile"
  );

  export const DoNotIncludeRiskProfile = new RatingType(
    false,
    "Do not include Risk Profile"
  );
}
