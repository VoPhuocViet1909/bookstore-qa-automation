import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="border-b border-border bg-muted/50">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <h1 className="mb-3 text-3xl font-bold text-foreground">Về BookSphere</h1>
            <p className="max-w-2xl text-muted-foreground">
              Chúng tôi kết nối những độc giả đam mê sách với thư viện phong phú gồm hàng nghìn tựa sách tiếng Việt
              và quốc tế, được tuyển chọn kỹ lưỡng cho mọi sở thích và mục tiêu.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Sứ mệnh của chúng tôi</h2>
              <p className="text-muted-foreground">
                BookSphere ra đời với mong muốn giúp việc khám phá và mua sách trở nên dễ dàng, thú vị hơn. Chúng tôi
                tin rằng mỗi cuốn sách đều có thể mở ra một góc nhìn mới, truyền cảm hứng và tạo ảnh hưởng tích cực đến
                cuộc sống của bạn.
              </p>
              <p className="text-muted-foreground">
                Từ những tác phẩm văn học kinh điển đến những đầu sách kỹ năng, kinh tế, giáo dục và thiếu nhi, chúng
                tôi luôn nỗ lực mang đến trải nghiệm tốt nhất: thông tin rõ ràng, gợi ý thông minh và dịch vụ tận tâm.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground">Vì sao chọn BookSphere?</h3>
              <ul className="mt-4 space-y-3 text-muted-foreground">
                <li>Kho sách đa dạng, cập nhật liên tục theo xu hướng đọc mới nhất.</li>
                <li>Gợi ý cá nhân hóa giúp bạn tìm được tựa sách phù hợp nhanh chóng.</li>
                <li>Chính sách đổi trả linh hoạt và hỗ trợ khách hàng tận tâm.</li>
                <li>Cộng đồng yêu sách thân thiện để bạn chia sẻ và khám phá.</li>
              </ul>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground">Hành trình phát triển</h3>
              <p className="mt-3 text-muted-foreground">
                Bắt đầu từ một nhóm những người yêu sách, BookSphere đã phát triển thành một nền tảng trực tuyến toàn
                diện. Chúng tôi liên tục cải tiến công nghệ, hợp tác với nhiều nhà xuất bản và đối tác phân phối để
                mang lại trải nghiệm tối ưu cho độc giả.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground">Cùng nhau nuôi dưỡng tri thức</h3>
              <p className="mt-3 text-muted-foreground">
                Chúng tôi luôn trân trọng sự đóng góp từ bạn. Hãy chia sẻ cảm nhận, đề xuất những đầu sách yêu thích hoặc
                cho chúng tôi biết những tính năng bạn cần. BookSphere phát triển mạnh mẽ nhờ cộng đồng độc giả tận tâm
                như bạn.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

