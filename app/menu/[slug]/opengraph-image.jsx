import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import dishes from "../../../public/menu-data.json";
import { findDishBySlug } from "../../lib/dish-slug";
import { etb } from "../../lib/format";

export const runtime = "nodejs";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image({ params }) {
  const { slug } = await params;
  const dish = findDishBySlug(dishes, slug);

  if (!dish) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 60,
          }}
        >
          Dish Not Found
        </div>
      ),
      size
    );
  }

  const imagePath = new URL(
    dish.image || "/images/doro.webp",
    "https://addiseats.et"
  ).pathname;
  const imageMimeTypes = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
  };
  const imageMimeType = imageMimeTypes[extname(imagePath).toLowerCase()];

  if (!imageMimeType) {
    throw new Error(`Unsupported Open Graph image format: ${imagePath}`);
  }

  const imageFile = await readFile(
    join(process.cwd(), "public", imagePath.replace(/^\/+/, ""))
  );
  const imageSrc = `data:${imageMimeType};base64,${imageFile.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "42px",
          background: "linear-gradient(135deg, #f7f3ed, #eadac7)",
          color: "#29251f",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            overflow: "hidden",
            borderRadius: 32,
            background: "#fffdf9",
            boxShadow: "0 24px 70px rgba(49, 39, 27, 0.18)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders this image into the social preview. */}
          <img
            src={imageSrc}
            alt={dish.name}
            width="520"
            height="546"
            style={{
              width: 520,
              height: 546,
              objectFit: "cover",
            }}
          />
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "48px",
            }}
          >
            <div
              style={{
                display: "flex",
                color: "#a84f2d",
                fontSize: 27,
                fontWeight: 700,
                letterSpacing: 3,
                marginBottom: 28,
              }}
            >
              ADDIS EATS
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 62,
                fontWeight: 700,
                lineHeight: 1.05,
                marginBottom: 18,
              }}
            >
              {dish.name}
            </div>
            <div
              style={{
                display: "flex",
                color: "#a84f2d",
                fontSize: 38,
                fontWeight: 700,
                marginBottom: 22,
              }}
            >
              {etb.format(dish.price)}
            </div>
            <div
              style={{
                display: "flex",
                color: "#746b60",
                fontSize: 25,
                lineHeight: 1.4,
              }}
            >
              {dish.description}
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}