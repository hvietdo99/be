import { registerDecorator, ValidationOptions } from 'class-validator';
import moment from 'moment';

export function IsDateStringAllFormatDecorator(
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsDateStringAllFormatDecorator',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: {
        validate(value: Date) {
          return moment(new Date(value)).isValid();
        },
        defaultMessage() {
          return `${propertyName} must be date`;
        },
      },
    });
  };
}
