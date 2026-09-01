import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from './Pagination';

describe('Pagination Component', () => {
  test('renders current page and page buttons correctly', () => {
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />
    );

    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next/i })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /Prev/i })).toBeDisabled();
  });

  test('calls onPageChange when a page number button is clicked', () => {
    const handlePageChange = jest.fn();
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={handlePageChange} />
    );

    fireEvent.click(screen.getByRole('button', { name: '2' }));
    expect(handlePageChange).toHaveBeenCalledWith(2);
  });

  test('disables next button on the last page', () => {
    render(
      <Pagination currentPage={5} totalPages={5} onPageChange={() => {}} />
    );

    expect(screen.getByRole('button', { name: /Next/i })).toBeDisabled();
  });
});