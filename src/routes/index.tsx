import { Meta, Title } from "@solidjs/meta";

export default function RootRedirect() {
  return (
    <>
      <Title>Presmerovanie na Knihu receptov</Title>
      <Meta charset="utf-8" />
      <Meta http-equiv="refresh" content="0; url=/cookmark/sk" />
      <Meta name="robots" content="noindex" />
      <Meta name="canonical" content="/cookmark/sk" />
      <div style="text-align: center; padding: 2rem; font-family: system-ui, sans-serif;">
        <script>{`window.location.replace('/cookmark/sk');`}</script>
      </div>
    </>
  );
}
