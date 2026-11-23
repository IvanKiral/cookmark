import { createListPage } from "~/app/list-page/createListPage.ts";
import { ListContent } from "~/app/list-page/ListContent.tsx";
import { ListFilters } from "~/app/list-page/ListFilters.tsx";
import { ListOverlays } from "~/app/list-page/ListOverlays.tsx";
import { ListPageFrame } from "~/app/list-page/ListPageFrame.tsx";
import { ListSelectionBar } from "~/app/list-page/ListSelectionBar.tsx";
import { ListSidebar } from "~/app/list-page/ListSidebar.tsx";
import { ListToolbar } from "~/app/list-page/ListToolbar.tsx";
import { PlaceHeader } from "~/app/list-page/PlaceHeader.tsx";

const Home = () => {
  const page = createListPage();

  return (
    <ListPageFrame
      isSelecting={page.isSelecting()}
      sidebar={<ListSidebar page={page} />}
      toolbar={<ListToolbar page={page} />}
      overlays={<ListOverlays page={page} />}
    >
      <ListSelectionBar page={page} />
      <ListFilters page={page} />
      <PlaceHeader page={page} />
      <ListContent page={page} />
    </ListPageFrame>
  );
};

export default Home;
