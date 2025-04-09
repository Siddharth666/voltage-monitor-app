using Microsoft.EntityFrameworkCore;
using VoltageData.Models;

namespace VoltageData.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<VData> VoltageReadings { get; set; }
    }
}
