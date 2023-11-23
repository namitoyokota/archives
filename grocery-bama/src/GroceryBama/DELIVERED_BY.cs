using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GroceryBama
{
    class DELIVERED_BY
    {
        public DELIVERED_BY() { }
        public int order_id { get; set; }
        public string deliverer_username { get; set; }
        public string is_delivered { get; set; }
        public string delivery_time { get; set; }
        public string delivery_date { get; set; }
    }
}
