"use client";
import "./userPhoto.scss";

type Props = {
  image: string | undefined;
  height: string;
  isOnline?: boolean;
  fn?: () => void;
};

export default function UserPhoto({ image, height, isOnline, fn }: Props) {
  const photoStyle = {
    height: height,
    aspectRatio: "1/1",
    borderRadius: "50%",
    border: isOnline ? "3px solid #0277fc" : "",
  };
  return (
    <img
      src={image}
      alt=""
      className="user-photo"
      style={photoStyle}
      onClick={fn}
    />
  );
}
