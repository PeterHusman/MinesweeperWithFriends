using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace MWFBackend.Controllers
{
    public class GameController : Controller
    {
        public static int BoardSizeFromMines(int mines)
        {
            //Source: Desmos, Google, Wolfram Alpha, and Black Magic
            return (int)Math.Round(Math.Sqrt(0.683079 * Math.Sqrt(1.03518e6 * mines + 1.42685e7) - 258.024));
        }
    }
}
