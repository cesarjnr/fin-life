import * as faker from 'faker';

const mockManyToOne = jest.fn().mockReturnValue(jest.fn());

jest.mock('typeorm', () => ({
  ...(jest.requireActual('typeorm') as Record<string, 'unknown'>),
  ManyToOne: mockManyToOne
}));

describe('ExpenseCategory', () => {
  it('should map relations', async () => {
    const { User } = await import('../users/user.entity');
    const { ExpenseCategory } = await import('./expenseCategory.entity');

    const mockManyToOneCall = mockManyToOne.mock.calls[0];
    const mockManyToOneFirstCallback = mockManyToOneCall[0];
    const mockManyToOneSecondCallback = mockManyToOneCall[1];
    const expenseCategory = new ExpenseCategory(
      faker.lorem.paragraph(),
      faker.datatype.number(100),
      faker.datatype.number(100)
    );
    const user = new User(faker.name.findName(), faker.internet.email(), faker.internet.password(16));

    user.expenseCategories = [expenseCategory];

    expect(mockManyToOneFirstCallback()).toBe(User);
    expect(mockManyToOneSecondCallback(user)).toStrictEqual(user.expenseCategories);
  });
});
