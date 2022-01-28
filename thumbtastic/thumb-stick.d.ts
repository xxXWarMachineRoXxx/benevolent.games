import { LitElement } from "lit";
export declare class ThumbStick extends LitElement {
    #private;
    static styles: import("lit").CSSResult;
    values: {
        x: number;
        y: number;
    };
    onstickmove: (values: {
        x: number;
        y: number;
    }) => void;
    firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1>;
}
