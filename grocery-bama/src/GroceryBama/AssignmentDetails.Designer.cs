namespace GroceryBama
{
    partial class AssignmentDetails
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.comboSelect = new System.Windows.Forms.ComboBox();
            this.label2 = new System.Windows.Forms.Label();
            this.button_update_status = new System.Windows.Forms.Button();
            this.button_back = new System.Windows.Forms.Button();
            this.textAll = new System.Windows.Forms.TextBox();
            this.label3 = new System.Windows.Forms.Label();
            this.button1 = new System.Windows.Forms.Button();
            this.SuspendLayout();
            // 
            // comboSelect
            // 
            this.comboSelect.FormattingEnabled = true;
            this.comboSelect.Items.AddRange(new object[] {
            "Pending",
            "Delivered"});
            this.comboSelect.Location = new System.Drawing.Point(705, 510);
            this.comboSelect.Name = "comboSelect";
            this.comboSelect.Size = new System.Drawing.Size(121, 24);
            this.comboSelect.TabIndex = 87;
            this.comboSelect.SelectedIndexChanged += new System.EventHandler(this.comboSelect_SelectedIndexChanged);
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(604, 513);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(95, 17);
            this.label2.TabIndex = 86;
            this.label2.Text = "Select Status:";
            this.label2.Click += new System.EventHandler(this.label2_Click);
            // 
            // button_update_status
            // 
            this.button_update_status.Location = new System.Drawing.Point(869, 497);
            this.button_update_status.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.button_update_status.Name = "button_update_status";
            this.button_update_status.Size = new System.Drawing.Size(107, 49);
            this.button_update_status.TabIndex = 85;
            this.button_update_status.Text = "Update Status";
            this.button_update_status.UseVisualStyleBackColor = true;
            this.button_update_status.Click += new System.EventHandler(this.button_update_status_Click);
            // 
            // button_back
            // 
            this.button_back.Location = new System.Drawing.Point(17, 497);
            this.button_back.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.button_back.Name = "button_back";
            this.button_back.Size = new System.Drawing.Size(107, 49);
            this.button_back.TabIndex = 84;
            this.button_back.Text = "Back";
            this.button_back.UseVisualStyleBackColor = true;
            this.button_back.Click += new System.EventHandler(this.button_back_Click);
            // 
            // textAll
            // 
            this.textAll.Location = new System.Drawing.Point(17, 55);
            this.textAll.Multiline = true;
            this.textAll.Name = "textAll";
            this.textAll.ReadOnly = true;
            this.textAll.ScrollBars = System.Windows.Forms.ScrollBars.Vertical;
            this.textAll.Size = new System.Drawing.Size(959, 436);
            this.textAll.TabIndex = 83;
            this.textAll.TextChanged += new System.EventHandler(this.textAll_TextChanged);
            // 
            // label3
            // 
            this.label3.AutoSize = true;
            this.label3.Font = new System.Drawing.Font("Microsoft Sans Serif", 16.2F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.label3.Location = new System.Drawing.Point(353, 10);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(286, 32);
            this.label3.TabIndex = 82;
            this.label3.Text = "Assignment Details:";
            this.label3.Click += new System.EventHandler(this.label3_Click);
            // 
            // button1
            // 
            this.button1.Location = new System.Drawing.Point(130, 497);
            this.button1.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.button1.Name = "button1";
            this.button1.Size = new System.Drawing.Size(107, 49);
            this.button1.TabIndex = 88;
            this.button1.Text = "List Items";
            this.button1.UseVisualStyleBackColor = true;
            this.button1.Click += new System.EventHandler(this.button1_Click);
            // 
            // AssignmentDetails
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 16F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(993, 556);
            this.Controls.Add(this.button1);
            this.Controls.Add(this.comboSelect);
            this.Controls.Add(this.label2);
            this.Controls.Add(this.button_update_status);
            this.Controls.Add(this.button_back);
            this.Controls.Add(this.textAll);
            this.Controls.Add(this.label3);
            this.Name = "AssignmentDetails";
            this.Text = "AssignmentDetails";
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion
        private System.Windows.Forms.ComboBox comboSelect;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.Button button_update_status;
        private System.Windows.Forms.Button button_back;
        private System.Windows.Forms.TextBox textAll;
        private System.Windows.Forms.Label label3;
        private System.Windows.Forms.Button button1;
    }
}