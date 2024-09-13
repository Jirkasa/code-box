import { describe, expect, it } from "vitest";
import { deleteEmptyStringFromArray } from "../../src/ts/utils/utils";

describe("deleteEmptyStringFromArray", () => {
    it("should remove all empty strings from array", () => {
        const array = ["test", "", "something", ""];

        deleteEmptyStringFromArray(array);

        expect(array).toEqual(["test", "something"]);
    });
});