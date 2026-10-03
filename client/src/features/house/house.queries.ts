import { useQuery } from "@tanstack/react-query";

import { getHouse } from "@/api/house.api";

export const houseQueryKeys = {
  all: ["house"] as const,
  detail: () => [...houseQueryKeys.all, "detail"] as const,
};

export const useHouseQuery = () => {
  return useQuery({
    queryKey: houseQueryKeys.detail(),
    queryFn: getHouse,
  });
};
