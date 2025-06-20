export interface ReservationData {
  id?: number;
  powerboat: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  annotation: string;
  startDate: string | Date;
  endDate: string | Date;
}
