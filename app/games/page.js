import { prisma } from "@/lib/prisma";

export default async function GamesPage() {
  const games = await prisma.game.findMany({
    include: {
      commission: true,
    },
  });

  return (
    <div style={{ padding: "20px" }}>
      <h1>Games</h1>

      {games.length === 0 ? (
        <p>No games found.</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Number</th>
              <th>Ticket Value</th>
              <th>Pack #</th>
              <th>Status</th>
              <th>Commission</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => (
              <tr key={game.GameID}>
                <td>{game.GameID}</td>
                <td>{game.GameName}</td>
                <td>{game.GameNumber}</td>
                <td>${game.TicketValue}</td>
                <td>{game.PackNumber}</td>
                <td>{game.ActiveGameStatus}</td>
                <td>{game.commission?.CommissionName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}