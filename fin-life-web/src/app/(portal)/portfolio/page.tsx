import Table from '../../_components/table';

export default function Portfolio() {
  const headers = ['Header 1', 'Header 2', ''];
  const data = [
    {
      id: 1,
      values: ['Value 1', 'Value 2', 'Value 3']
    },
    {
      id: 2,
      values: ['Value 1', 'Value 2', 'Value 3']
    }
  ];

  return (
    <Table title="Retirement" headers={headers} rowsData={data} />
  );
}
