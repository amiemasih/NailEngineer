import { redirect } from "next/navigation";

// The submitted training images now live on the tech dashboard itself.
export default function TechTrainingImagesRedirect() {
  redirect("/tech/dashboard");
}
