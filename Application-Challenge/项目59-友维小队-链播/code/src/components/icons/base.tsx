import { IonIcon } from "@ionic/vue";
import {
  closeCircle,
  closeOutline,
  checkmarkCircle,
  checkmarkCircleOutline,
  arrowUndoOutline,
  arrowUndoCircle,
  chevronBackOutline,
} from "ionicons/icons";

export const HIconClose = (props: any) => {
  return <IonIcon src={props.round ? closeCircle : closeOutline}></IonIcon>;
};

export const HIconUndo = (props: any) => {
  return (
    <IonIcon
      color="warning"
      src={props.round ? arrowUndoCircle : arrowUndoOutline}
    ></IonIcon>
  );
};
export const HIconConfirm = (props: any) => {
  return (
    <IonIcon
      color="success"
      src={props.round ? checkmarkCircle : checkmarkCircleOutline}
    ></IonIcon>
  );
};
export const HIconRouterBack = (props: any) => {
  return <IonIcon style={{ fontSize: '32px' }} src={chevronBackOutline}></IonIcon>;
};
