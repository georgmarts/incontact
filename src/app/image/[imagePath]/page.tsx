"use client";
import Header from "@/components/Header";
import "./image.scss";
import Button from "@/components/Button";

type Props = {
  params: {
    imagePath: string;
  };
};

export default function Page({ params }: Props) {
  const { imagePath } = params;
  const baseImageUrl =
    "https://fsmlpmfunvdgvvoanhds.supabase.co/storage/v1/object/public/vk-images/";
  const src = baseImageUrl + imagePath;

  function downloadImage() {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      // create Canvas
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      // create <a> tag
      const a = document.createElement("a");
      a.download = "download.png";
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
  }

  console.log("rerendered");

  return (
    <main className="image-page">
      <Header>
        <h3>Image</h3>
      </Header>
      <div className="image-page__img-container">
        {/* <img src="/icons/dots-white.svg" alt="" className="image-page__dots" /> */}
        <img src={baseImageUrl + imagePath} alt="" />
        <Button label="Download image" fn={downloadImage} />
      </div>
    </main>
  );
}
